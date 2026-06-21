import { sql } from '@/lib/db';

const TABLE_WHITELIST = {
  demand_plan: 'demand_plan',
  tendering_procedures: 'tendering_procedures',
  priority_contracts: 'priority_contracts',
  awarding: 'awarding',
  contracting: 'contracting',
  active_contracts: 'active_contracts',
  portfolio_plan: 'portfolio_plan',
  portfolio_details: 'portfolio_details',
  annual_cycle: 'annual_cycle'
};

// GET project details and comments
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const stage = resolvedParams.stage;
    const id = parseFloat(resolvedParams.id);

    if (isNaN(id) || !stage || !TABLE_WHITELIST[stage]) {
      return Response.json({ error: "معلمات غير صالحة" }, { status: 400 });
    }

    const tableName = TABLE_WHITELIST[stage];
    
    // Fetch project details
    const projectRows = await sql.query(`SELECT * FROM ${tableName} WHERE id = $1`, [id]);
    
    if (projectRows.length === 0) {
      return Response.json({ error: "المشروع غير موجود" }, { status: 404 });
    }

    const project = projectRows[0];
    if (['demand_plan', 'tendering_procedures', 'priority_contracts', 'awarding', 'contracting', 'active_contracts'].includes(stage)) {
      const pmRows = await sql`
        SELECT is_priority, c1, c2, c3, c4, c5, c6, final_score FROM priority_matrix 
        WHERE LOWER(TRIM(project_name)) = LOWER(TRIM(${project.project_name}))
        LIMIT 1
      `;
      if (pmRows.length > 0) {
        project.is_priority = pmRows[0].is_priority;
        project.c1 = pmRows[0].c1;
        project.c2 = pmRows[0].c2;
        project.c3 = pmRows[0].c3;
        project.c4 = pmRows[0].c4;
        project.c5 = pmRows[0].c5;
        project.c6 = pmRows[0].c6;
        project.final_score = pmRows[0].final_score;
      } else {
        project.is_priority = false;
      }
    }

    // Fetch comments
    const comments = await sql`
      SELECT * FROM comments 
      WHERE project_id = ${id} AND stage = ${stage} 
      ORDER BY created_at DESC
    `;

    return Response.json({
      success: true,
      project: projectRows[0],
      comments
    });

  } catch (error) {
    console.error("Fetch Project Details Error:", error);
    return Response.json({ error: "حدث خطأ أثناء تحميل تفاصيل المشروع" }, { status: 500 });
  }
}

// POST a new comment / update
export async function POST(request, { params }) {
  try {
    const resolvedParams = await params;
    const stage = resolvedParams.stage;
    const id = parseFloat(resolvedParams.id);

    if (isNaN(id) || !stage || !TABLE_WHITELIST[stage]) {
      return Response.json({ error: "معلمات غير صالحة" }, { status: 400 });
    }

    const { comment_text, commenter_name } = await request.json();
    
    if (!comment_text || !comment_text.trim()) {
      return Response.json({ error: "يرجى كتابة نص التحديث" }, { status: 400 });
    }

    const name = commenter_name || "عضو اللجنة";

    // 1. Insert comment into comments table
    await sql`
      INSERT INTO comments (project_id, stage, comment_text, commenter_name) 
      VALUES (${id}, ${stage}, ${comment_text.trim()}, ${name})
    `;

    // 2. Update the main table with the latest update text to show in summaries
    const tableName = TABLE_WHITELIST[stage];
    if (tableName === 'active_contracts') {
      // For active contracts, update the 'notes' field
      await sql.query(`UPDATE active_contracts SET notes = $1 WHERE id = $2`, [comment_text.trim(), id]);
    } else if (tableName === 'priority_contracts') {
      await sql.query(`UPDATE priority_contracts SET weekly_update = $1 WHERE id = $2`, [comment_text.trim(), id]);
    } else if (tableName === 'demand_plan') {
      await sql.query(`UPDATE demand_plan SET weekly_update = $1 WHERE id = $2`, [comment_text.trim(), id]);
    } else if (tableName === 'tendering_procedures') {
      await sql.query(`UPDATE tendering_procedures SET weekly_update = $1 WHERE id = $2`, [comment_text.trim(), id]);
    } else if (tableName === 'awarding') {
      await sql.query(`UPDATE awarding SET weekly_update = $1 WHERE id = $2`, [comment_text.trim(), id]);
    } else if (tableName === 'contracting') {
      await sql.query(`UPDATE contracting SET weekly_update = $1 WHERE id = $2`, [comment_text.trim(), id]);
    }

    return Response.json({
      success: true,
      message: "تم حفظ التحديث بنجاح"
    });

  } catch (error) {
    console.error("Add Comment Error:", error);
    return Response.json({ error: "حدث خطأ أثناء حفظ التحديث" }, { status: 500 });
  }
}
