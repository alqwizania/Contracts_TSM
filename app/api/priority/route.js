import { sql } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_for_contracts_committee_2026_pha';

// GET all projects from the Priority Matrix
export async function GET(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return Response.json({ error: "غير مصرح" }, { status: 401 });
  }
  try {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return Response.json({ error: "جلسة غير صالحة" }, { status: 401 });
  }

  try {
    const rows = await sql`
      SELECT 
        id,
        project_name,
        description,
        c1_label,
        c1_justification,
        c2_label,
        c2_justification,
        c3_label,
        c3_justification,
        c4_label,
        c4_justification,
        c5_label,
        c5_justification,
        financial_alignment_status,
        funding_feasibility,
        leadership_support,
        c1,
        c2,
        c3,
        c4,
        c5,
        budget,
        c6,
        final_score,
        can_distribute,
        is_priority
      FROM priority_matrix
      ORDER BY id ASC
    `;

    return Response.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error("Fetch Priority Error:", error);
    return Response.json({ error: "حدث خطأ أثناء تحميل مصفوفة الأولويات" }, { status: 500 });
  }
}

// PUT (Update) project priority criteria scores and labels
export async function PUT(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return Response.json({ error: "غير مصرح" }, { status: 401 });
  }
  let user = null;
  try {
    const token = authHeader.split(' ')[1];
    user = jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return Response.json({ error: "جلسة غير صالحة" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      id,
      c1, c2, c3, c4, c5,
      c1_label, c2_label, c3_label, c4_label, c5_label,
      c1_justification, c2_justification, c3_justification, c4_justification, c5_justification,
      financial_alignment_status, funding_feasibility, leadership_support,
      budget,
      can_distribute,
      project_name,
      is_priority
    } = body;

    const projectId = parseFloat(id);
    if (isNaN(projectId)) {
      return Response.json({ error: "معرّف المشروع غير صالح" }, { status: 400 });
    }

    const budgetVal = parseFloat(budget) || 0;
    const isDistribute = String(can_distribute).trim() === 'نعم';
    const isPriorityVal = is_priority === true || is_priority === 'true';

    // C6 calculation based on budget and distribution choice:
    let computedC6 = 1;
    if (budgetVal <= 1000000) {
      computedC6 = 5;
    } else if (budgetVal <= 5000000) {
      computedC6 = isDistribute ? 4 : 3;
    } else {
      computedC6 = isDistribute ? 2 : 1;
    }

    const c1Val = parseFloat(c1) || 0;
    const c2Val = parseFloat(c2) || 0;
    const c3Val = parseFloat(c3) || 0;
    const c4Val = parseFloat(c4) || 0;
    const c5Val = parseFloat(c5) || 0;

    const phaseOneScore = (c1Val * 0.15) + (c2Val * 0.15) + (c3Val * 0.15) + (c4Val * 0.35) + (c5Val * 0.20);
    const computedFinalScore = (phaseOneScore * 0.8) + (computedC6 * 0.2);

    // 1. Update Priority Matrix
    await sql`
      UPDATE priority_matrix SET
        c1 = ${c1Val},
        c2 = ${c2Val},
        c3 = ${c3Val},
        c4 = ${c4Val},
        c5 = ${c5Val},
        c1_label = ${c1_label || null},
        c2_label = ${c2_label || null},
        c3_label = ${c3_label || null},
        c4_label = ${c4_label || null},
        c5_label = ${c5_label || null},
        c1_justification = ${c1_justification || null},
        c2_justification = ${c2_justification || null},
        c3_justification = ${c3_justification || null},
        c4_justification = ${c4_justification || null},
        c5_justification = ${c5_justification || null},
        financial_alignment_status = ${financial_alignment_status || null},
        funding_feasibility = ${funding_feasibility || null},
        leadership_support = ${leadership_support || null},
        budget = ${budgetVal},
        c6 = ${computedC6},
        final_score = ${computedFinalScore},
        can_distribute = ${can_distribute || null},
        is_priority = ${isPriorityVal}
      WHERE id = ${projectId}
    `;

    // 2. Update Priority Calculator
    await sql`
      UPDATE priority_calculator SET
        budget = ${budgetVal},
        c1 = ${c1Val},
        c2 = ${c2Val},
        c3 = ${c3Val},
        c4 = ${c4Val},
        c5 = ${c5Val},
        c6 = ${computedC6},
        final_score = ${computedFinalScore},
        can_distribute = ${can_distribute || null},
        is_priority = ${isPriorityVal}
      WHERE id = ${projectId}
    `;

    // 3. Log a comment in comments table tracking this update
    const commentText = `تم تحديث التقييم (المرحلة الأولى: ${phaseOneScore.toFixed(2)}, مالي C6: ${computedC6}) بنتيجة نهائية مرجحة: ${computedFinalScore.toFixed(2)}`;
    
    await sql`
      INSERT INTO comments (project_id, stage, comment_text, commenter_name)
      VALUES (${projectId}, 'priority_matrix', ${commentText}, ${user.full_name || user.username})
    `;

    // 4. Update demand_plan if project exists there
    if (project_name) {
      await sql`
        UPDATE demand_plan SET
          priority_calculator_result = ${computedFinalScore.toFixed(2)},
          notes = ${`آخر تقييم للجنة: ${computedFinalScore.toFixed(2)}`}
        WHERE project_name = ${project_name} OR id = ${projectId}
      `;
    }

    return Response.json({
      success: true,
      message: "تم حفظ التقييم بنجاح وحساب النتيجة المرجحة"
    });

  } catch (error) {
    console.error("Update Priority Error:", error);
    return Response.json({ error: "حدث خطأ أثناء حفظ تقييم الأولويات" }, { status: 500 });
  }
}

// POST (Create) a new project and add it to priority matrix and calculator
export async function POST(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return Response.json({ error: "غير مصرح" }, { status: 401 });
  }
  let user = null;
  try {
    const token = authHeader.split(' ')[1];
    user = jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return Response.json({ error: "جلسة غير صالحة" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      project_name,
      description,
      c1, c2, c3, c4, c5,
      c1_label, c2_label, c3_label, c4_label, c5_label,
      c1_justification, c2_justification, c3_justification, c4_justification, c5_justification,
      financial_alignment_status, funding_feasibility, leadership_support,
      budget,
      can_distribute,
      is_priority
    } = body;

    if (!project_name || project_name.trim() === '') {
      return Response.json({ error: "اسم المشروع مطلوب" }, { status: 400 });
    }

    // Check for duplicate project name
    const existingResult = await sql`
      SELECT id FROM priority_matrix 
      WHERE LOWER(project_name) = LOWER(${project_name.trim()})
    `;
    if (existingResult.length > 0) {
      return Response.json({ error: "هذا المشروع مضاف بالفعل في مصفوفة الأولويات" }, { status: 409 });
    }

    // Generate next ID
    const maxIdResult = await sql`SELECT MAX(id) as max_id FROM priority_matrix`;
    const nextId = (maxIdResult[0]?.max_id || 0) + 1;

    const budgetVal = parseFloat(budget) || 0;
    const isDistribute = String(can_distribute).trim() === 'نعم';
    const isPriorityVal = is_priority === true || is_priority === 'true';
    
    // C6 calculation based on budget and distribution choice:
    let computedC6 = 1;
    if (budgetVal <= 1000000) {
      computedC6 = 5;
    } else if (budgetVal <= 5000000) {
      computedC6 = isDistribute ? 4 : 3;
    } else {
      computedC6 = isDistribute ? 2 : 1;
    }
    
    const c1Val = c1 !== undefined && c1 !== null ? parseFloat(c1) : 1;
    const c2Val = c2 !== undefined && c2 !== null ? parseFloat(c2) : 1;
    const c3Val = c3 !== undefined && c3 !== null ? parseFloat(c3) : 1;
    const c4Val = c4 !== undefined && c4 !== null ? parseFloat(c4) : 1;
    const c5Val = c5 !== undefined && c5 !== null ? parseFloat(c5) : 1;
    
    const phaseOneScore = (c1Val * 0.15) + (c2Val * 0.15) + (c3Val * 0.15) + (c4Val * 0.35) + (c5Val * 0.20);
    const computedFinalScore = (phaseOneScore * 0.8) + (computedC6 * 0.2);

    // Insert into priority_matrix
    await sql`
      INSERT INTO priority_matrix (
        id, project_name, description, c1_label, c1_justification, c2_label, c2_justification,
        c3_label, c3_justification, c4_label, c4_justification, c5_label, c5_justification,
        financial_alignment_status, funding_feasibility, leadership_support, c1, c2, c3, c4, c5,
        budget, c6, final_score, can_distribute, is_priority
      ) VALUES (
        ${nextId},
        ${project_name.trim()},
        ${description || null},
        ${c1_label || null},
        ${c1_justification || null},
        ${c2_label || null},
        ${c2_justification || null},
        ${c3_label || null},
        ${c3_justification || null},
        ${c4_label || null},
        ${c4_justification || null},
        ${c5_label || null},
        ${c5_justification || null},
        ${financial_alignment_status || null},
        ${funding_feasibility || null},
        ${leadership_support || null},
        ${c1Val},
        ${c2Val},
        ${c3Val},
        ${c4Val},
        ${c5Val},
        ${budgetVal},
        ${computedC6},
        ${computedFinalScore},
        ${can_distribute || null},
        ${isPriorityVal}
      )
    `;

    // Insert into priority_calculator
    await sql`
      INSERT INTO priority_calculator (
        id, project_name, budget, c1, c2, c3, c4, c5, c6, final_score, can_distribute, is_priority
      ) VALUES (
        ${nextId},
        ${project_name.trim()},
        ${budgetVal},
        ${c1Val},
        ${c2Val},
        ${c3Val},
        ${c4Val},
        ${c5Val},
        ${computedC6},
        ${computedFinalScore},
        ${can_distribute || null},
        ${isPriorityVal}
      )
    `;

    // Log a comment
    const commentText = `تم إضافة المشروع الجديد بـ (C1: ${c1Val}, C2: ${c2Val}, C3: ${c3Val}, C4: ${c4Val}, C5: ${c5Val}, C6: ${computedC6}) بوزن نهائي: ${computedFinalScore.toFixed(2)}`;
    await sql`
      INSERT INTO comments (project_id, stage, comment_text, commenter_name)
      VALUES (${nextId}, 'priority_matrix', ${commentText}, ${user.full_name || user.username})
    `;

    return Response.json({
      success: true,
      message: "تم إضافة وتقييم المشروع بنجاح",
      id: nextId
    });

  } catch (error) {
    console.error("Create Priority Error:", error);
    return Response.json({ error: "حدث خطأ أثناء إضافة وتقييم المشروع" }, { status: 500 });
  }
}
