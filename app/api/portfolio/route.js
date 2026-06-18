import { sql } from '@/lib/db';
import jwt from 'jsonwebtoken';

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

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'list';
    
    // --- 1. Fetch Aggregated Summary / KPI Dashboard Data ---
    if (type === 'summary') {
      // Fetch all dashboard stats in parallel
      const [
        demandCount,
        tenderingCount,
        priorityCount,
        awardingCount,
        contractingCount,
        activeCount,
        heiaRagStats,
        transformationRagStats,
        sectorStats,
        heiaStatsQuery,
        transformationStatsQuery,
        heiaClassificationQuery,
        transClassificationQuery,
        latestComments,
        topPriorityProjects,
        sectorBudgetStatsQuery,
        sCurveQuery,
        classificationTreemapStatsQuery
      ] = await Promise.all([
        sql`SELECT COUNT(*)::int as count, COALESCE(SUM(estimated_value), 0)::double precision as budget FROM demand_plan`,
        sql`SELECT COUNT(*)::int as count FROM tendering_procedures`,
        sql`SELECT COUNT(*)::int as count FROM priority_contracts`,
        sql`SELECT COUNT(*)::int as count FROM awarding`,
        sql`SELECT COUNT(*)::int as count, COALESCE(SUM(total_cost), 0)::double precision as budget FROM contracting`,
        sql`
          SELECT 
            COUNT(*)::int as count, 
            COALESCE(SUM(total_cost), 0)::double precision as total_cost,
            COALESCE(SUM(total_spent), 0)::double precision as total_spent,
            COALESCE(SUM(remaining_liquidity), 0)::double precision as remaining_liquidity,
            COALESCE(SUM(annual_liquidity), 0)::double precision as annual_liquidity
          FROM active_contracts
        `,
        sql`
          SELECT 
            progress_status as status,
            COUNT(*)::int as count
          FROM active_contracts 
          WHERE progress_status IS NOT NULL AND progress_status != '' AND budget_source = 'ميزانية الهيئة'
          GROUP BY progress_status
        `,
        sql`
          SELECT 
            progress_status as status,
            COUNT(*)::int as count
          FROM active_contracts 
          WHERE progress_status IS NOT NULL AND progress_status != '' AND budget_source = 'برنامج التحول'
          GROUP BY progress_status
        `,
        sql`
          SELECT sector, COUNT(*)::int as count 
          FROM active_contracts 
          WHERE sector IS NOT NULL AND sector != ''
          GROUP BY sector
          ORDER BY count DESC
          LIMIT 5
        `,
        sql`
          SELECT
            (SELECT COUNT(*)::int FROM demand_plan WHERE funding_source = 'ميزانية الهيئة') as demand_count,
            (SELECT COALESCE(SUM(estimated_value), 0)::double precision FROM demand_plan WHERE funding_source = 'ميزانية الهيئة') as demand_budget,
            (SELECT COUNT(*)::int FROM tendering_procedures WHERE budget_source = 'ميزانية الهيئة') as tendering_count,
            (SELECT COUNT(*)::int FROM awarding WHERE budget_source = 'ميزانية الهيئة') as awarding_count,
            (SELECT COUNT(*)::int FROM contracting WHERE budget_source = 'ميزانية الهيئة') as contracting_count,
            (SELECT COALESCE(SUM(total_cost), 0)::double precision FROM contracting WHERE budget_source = 'ميزانية الهيئة') as contracting_budget,
            (SELECT COUNT(*)::int FROM active_contracts WHERE budget_source = 'ميزانية الهيئة') as active_count,
            (SELECT COALESCE(SUM(total_cost), 0)::double precision FROM active_contracts WHERE budget_source = 'ميزانية الهيئة') as active_budget
        `,
        sql`
          SELECT
            (SELECT COUNT(*)::int FROM demand_plan WHERE funding_source = 'برنامج التحول') as demand_count,
            (SELECT COALESCE(SUM(estimated_value), 0)::double precision FROM demand_plan WHERE funding_source = 'برنامج التحول') as demand_budget,
            (SELECT COUNT(*)::int FROM tendering_procedures WHERE budget_source = 'برنامج التحول') as tendering_count,
            (SELECT COUNT(*)::int FROM awarding WHERE budget_source = 'برنامج التحول') as awarding_count,
            (SELECT COUNT(*)::int FROM contracting WHERE budget_source = 'برنامج التحول') as contracting_count,
            (SELECT COALESCE(SUM(total_cost), 0)::double precision FROM contracting WHERE budget_source = 'برنامج التحول') as contracting_budget,
            (SELECT COUNT(*)::int FROM active_contracts WHERE budget_source = 'برنامج التحول') as active_count,
            (SELECT COALESCE(SUM(total_cost), 0)::double precision FROM active_contracts WHERE budget_source = 'برنامج التحول') as active_budget
        `,
        sql`
          SELECT COALESCE(classification, 'غير محدد') as classification, COUNT(*)::int as count
          FROM (
            SELECT project_classification as classification FROM demand_plan WHERE funding_source = 'ميزانية الهيئة'
            UNION ALL
            SELECT classification FROM tendering_procedures WHERE budget_source = 'ميزانية الهيئة'
            UNION ALL
            SELECT classification FROM awarding WHERE budget_source = 'ميزانية الهيئة'
            UNION ALL
            SELECT classification FROM contracting WHERE budget_source = 'ميزانية الهيئة'
            UNION ALL
            SELECT classification FROM active_contracts WHERE budget_source = 'ميزانية الهيئة'
          ) t
          GROUP BY classification
        `,
        sql`
          SELECT COALESCE(classification, 'غير محدد') as classification, COUNT(*)::int as count
          FROM (
            SELECT project_classification as classification FROM demand_plan WHERE funding_source = 'برنامج التحول'
            UNION ALL
            SELECT classification FROM tendering_procedures WHERE budget_source = 'برنامج التحول'
            UNION ALL
            SELECT classification FROM awarding WHERE budget_source = 'برنامج التحول'
            UNION ALL
            SELECT classification FROM contracting WHERE budget_source = 'برنامج التحول'
            UNION ALL
            SELECT classification FROM active_contracts WHERE budget_source = 'برنامج التحول'
          ) t
          GROUP BY classification
        `,
        sql`
          SELECT c.*, 
            COALESCE(d.project_name, tp.project_name, pc.project_name, aw.project_name, co.project_name, ac.project_name, pm.project_name) as project_title
          FROM comments c
          LEFT JOIN demand_plan d ON c.project_id = d.id AND c.stage = 'demand_plan'
          LEFT JOIN tendering_procedures tp ON c.project_id = tp.id AND c.stage = 'tendering_procedures'
          LEFT JOIN priority_contracts pc ON c.project_id = pc.id AND c.stage = 'priority_contracts'
          LEFT JOIN awarding aw ON c.project_id = aw.id AND c.stage = 'awarding'
          LEFT JOIN contracting co ON c.project_id = co.id AND c.stage = 'contracting'
          LEFT JOIN active_contracts ac ON c.project_id = ac.id AND c.stage = 'active_contracts'
          LEFT JOIN priority_matrix pm ON c.project_id = pm.id AND c.stage = 'priority_matrix'
          ORDER BY c.created_at DESC
          LIMIT 5
        `,
        sql`
          SELECT id, project_name, 
            (c1*0.15 + c2*0.15 + c3*0.15 + c4*0.35 + c5*0.20) as total_score
          FROM priority_matrix
          ORDER BY total_score DESC
          LIMIT 5
        `,
        sql`
          SELECT 
            sector, 
            COALESCE(SUM(total_cost), 0)::double precision as budget, 
            COALESCE(SUM(total_spent), 0)::double precision as spent
          FROM active_contracts 
          WHERE sector IS NOT NULL AND sector != ''
          GROUP BY sector
          ORDER BY budget DESC
        `,
        sql`
          SELECT 
            project_name, 
            start_date, 
            end_date, 
            COALESCE(total_cost, 0)::double precision as budget,
            COALESCE(planned_progress, 0)::double precision as planned_progress,
            COALESCE(actual_progress, 0)::double precision as actual_progress
          FROM active_contracts
          WHERE start_date IS NOT NULL AND end_date IS NOT NULL
        `,
        sql`
          SELECT 
            COALESCE(classification, 'غير محدد') as name, 
            COALESCE(SUM(total_cost), 0)::double precision as value
          FROM active_contracts
          WHERE classification IS NOT NULL AND classification != ''
          GROUP BY classification
          ORDER BY value DESC
        `
      ]);

      // Normalize classifications for HEIA
      const heiaClassMap = {};
      heiaClassificationQuery.forEach(row => {
        let label = row.classification.trim();
        if (label === 'سلاسل الامداد' || label === 'سلاسل الإمداد') label = 'سلاسل الإمداد';
        else if (label === 'سلاسل الامداد (تحول)' || label === 'سلاسل الإمداد (تحول)') label = 'سلاسل الإمداد (تحول)';
        else if (label === 'تشغيلي') label = 'تشغيلي';
        else if (label === 'تشغيلي (تحول)') label = 'تشغيلي (تحول)';
        else if (label === 'مشروع') label = 'مشروع';
        
        heiaClassMap[label] = (heiaClassMap[label] || 0) + row.count;
      });

      const normalizedHeiaClass = Object.keys(heiaClassMap).map(key => ({
        name: key,
        value: heiaClassMap[key]
      }));

      // Normalize classifications for Transformation
      const transClassMap = {};
      transClassificationQuery.forEach(row => {
        let label = row.classification.trim();
        if (label === 'سلاسل الامداد' || label === 'سلاسل الإمداد') label = 'سلاسل الإمداد';
        else if (label === 'سلاسل الامداد (تحول)' || label === 'سلاسل الإمداد (تحول)') label = 'سلاسل الإمداد (تحول)';
        else if (label === 'تشغيلي') label = 'تشغيلي';
        else if (label === 'تشغيلي (تحول)') label = 'تشغيلي (تحول)';
        else if (label === 'مشروع') label = 'مشروع';
        
        transClassMap[label] = (transClassMap[label] || 0) + row.count;
      });

      const normalizedTransClass = Object.keys(transClassMap).map(key => ({
        name: key,
        value: transClassMap[key]
      }));

      // S-Curve calculations
      const sCurveContracts = sCurveQuery || [];
      let minDate = null;
      let maxDate = null;

      sCurveContracts.forEach(c => {
        const start = c.start_date ? new Date(c.start_date) : null;
        const end = c.end_date ? new Date(c.end_date) : null;
        if (start && end && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
          if (!minDate || start < minDate) minDate = start;
          if (!maxDate || end > maxDate) maxDate = end;
        }
      });

      // Default dates if no contracts exist
      if (!minDate) minDate = new Date("2025-01-01");
      if (!maxDate) maxDate = new Date("2026-12-31");

      // Set to first of month
      minDate = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
      maxDate = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

      // Cap future dates to prevent logic bugs
      const today = new Date();
      const twoYearsOut = new Date(today.getFullYear() + 2, 11, 1);
      if (maxDate > twoYearsOut) {
        maxDate = twoYearsOut;
      }

      // Generate months list
      const monthsList = [];
      let currentMonth = new Date(minDate);
      while (currentMonth <= maxDate) {
        monthsList.push(new Date(currentMonth));
        currentMonth.setMonth(currentMonth.getMonth() + 1);
        if (monthsList.length > 48) break; // sanity cap
      }

      const sCurveStats = monthsList.map(m => {
        const mTime = m.getTime();
        let totalWeight = 0;
        let weightedPlanned = 0;
        let weightedActual = 0;

        sCurveContracts.forEach(c => {
          const start = c.start_date ? new Date(c.start_date).getTime() : null;
          const end = c.end_date ? new Date(c.end_date).getTime() : null;
          const weight = c.budget || 1;

          if (!start || !end || isNaN(start) || isNaN(end) || end <= start) return;

          totalWeight += weight;

          // Normalize progress to percentages out of 100
          let plannedPercent = c.planned_progress || 0;
          if (plannedPercent > 0 && plannedPercent <= 1) plannedPercent *= 100;
          let actualPercent = c.actual_progress || 0;
          if (actualPercent > 0 && actualPercent <= 1) actualPercent *= 100;

          if (mTime <= start) {
            weightedPlanned += 0;
            weightedActual += 0;
          } else if (mTime >= end) {
            weightedPlanned += plannedPercent * weight;
            weightedActual += actualPercent * weight;
          } else {
            const totalDuration = end - start;
            const elapsed = mTime - start;
            const ratio = elapsed / totalDuration;
            
            weightedPlanned += (plannedPercent * ratio) * weight;
            weightedActual += (actualPercent * ratio) * weight;
          }
        });

        const yearStr = m.getFullYear();
        const monthStr = String(m.getMonth() + 1).padStart(2, '0');

        return {
          month: `${yearStr}-${monthStr}`,
          planned: totalWeight > 0 ? parseFloat((weightedPlanned / totalWeight).toFixed(1)) : 0,
          actual: totalWeight > 0 ? parseFloat((weightedActual / totalWeight).toFixed(1)) : 0
        };
      });

      return Response.json({
        success: true,
        summary: {
          demand: demandCount[0],
          tendering: tenderingCount[0],
          priority: priorityCount[0],
          awarding: awardingCount[0],
          contracting: contractingCount[0],
          active: activeCount[0],
          total: demandCount[0].count + tenderingCount[0].count + awardingCount[0].count + contractingCount[0].count + activeCount[0].count
        },
        activeRagStats: heiaRagStats,
        heiaRagStats,
        transformationRagStats,
        sectorStats,
        latestComments,
        topPriorityProjects,
        budgetSourcesStats: {
          heia: heiaStatsQuery[0],
          transformation: transformationStatsQuery[0]
        },
        heiaClassificationStats: normalizedHeiaClass,
        transformationClassificationStats: normalizedTransClass,
        classificationStats: normalizedHeiaClass,
        sectorBudgetStats: sectorBudgetStatsQuery || [],
        sCurveStats,
        classificationTreemapStats: classificationTreemapStatsQuery || []
      });

    }

    // --- 2. Fetch Tabular Lists (with dynamic stages, search, filters) ---
    const stage = searchParams.get('stage');
    if (!stage) {
      return Response.json({ error: "المرحلة غير صالحة" }, { status: 400 });
    }

    const search = searchParams.get('search') || '';
    const budgetSource = searchParams.get('budget_source');
    const classification = searchParams.get('classification');
    const progressStatus = searchParams.get('progress_status') || searchParams.get('status');

    if (stage === 'all') {
      let query = `
        SELECT * FROM (
          SELECT id, project_name, sector, owning_department, funding_source as budget_source, estimated_value as total_cost, 'خطة الطلبات' as stage_name, project_classification as classification, NULL as progress_status FROM demand_plan
          UNION ALL
          SELECT id, project_name, sector, owning_department, budget_source, 0 as total_cost, 'في الطرح' as stage_name, classification, NULL as progress_status FROM tendering_procedures
          UNION ALL
          SELECT id, project_name, sector, owning_department, budget_source, 0 as total_cost, 'الترسية' as stage_name, classification, NULL as progress_status FROM awarding
          UNION ALL
          SELECT id, project_name, sector, owning_department, budget_source, total_cost, 'التعاقد' as stage_name, classification, NULL as progress_status FROM contracting
          UNION ALL
          SELECT id, project_name, sector, owning_department, budget_source, total_cost, 'عقد نشط' as stage_name, classification, progress_status FROM active_contracts
        ) t WHERE 1=1
      `;
      const params = [];
      let paramIdx = 1;

      if (search.trim()) {
        const searchPattern = `%${search.trim()}%`;
        params.push(searchPattern);
        query += ` AND (project_name ILIKE $${paramIdx} OR sector ILIKE $${paramIdx} OR owning_department ILIKE $${paramIdx})`;
        paramIdx++;
      }

      if (budgetSource) {
        params.push(budgetSource);
        query += ` AND budget_source = $${paramIdx}`;
        paramIdx++;
      }

      if (classification) {
        params.push(classification);
        query += ` AND classification = $${paramIdx}`;
        paramIdx++;
      }

      if (progressStatus) {
        params.push(progressStatus);
        query += ` AND progress_status = $${paramIdx}`;
        paramIdx++;
      }

      query += ` ORDER BY id ASC`;
      const rows = await sql.query(query, params);
      return Response.json({
        success: true,
        stage: 'all',
        count: rows.length,
        data: rows
      });
    }

    if (!TABLE_WHITELIST[stage]) {
      return Response.json({ error: "المرحلة غير صالحة" }, { status: 400 });
    }

    const tableName = TABLE_WHITELIST[stage];
    
    let query = `SELECT * FROM ${tableName} WHERE 1=1`;
    const params = [];
    let paramIdx = 1;
    
    // Add searching capability if search text is provided
    if (search.trim()) {
      const searchPattern = `%${search.trim()}%`;
      params.push(searchPattern);
      
      // Determine columns to search based on table schema
      if (tableName === 'demand_plan' || tableName === 'priority_contracts' || tableName === 'active_contracts') {
        query += ` AND (project_name ILIKE $${paramIdx} OR sector ILIKE $${paramIdx} OR owning_department ILIKE $${paramIdx})`;
      } else if (tableName === 'tendering_procedures') {
        query += ` AND (project_name ILIKE $${paramIdx} OR sector ILIKE $${paramIdx} OR procurement_officer ILIKE $${paramIdx})`;
      } else if (tableName === 'awarding' || tableName === 'contracting') {
        query += ` AND (project_name ILIKE $${paramIdx} OR sector ILIKE $${paramIdx} OR project_manager ILIKE $${paramIdx})`;
      } else if (tableName === 'portfolio_plan' || tableName === 'portfolio_details') {
        query += ` AND (main_activities ILIKE $${paramIdx} OR leading_entity ILIKE $${paramIdx})`;
      } else {
        query += ` AND (main_activities ILIKE $${paramIdx} OR leading_entity ILIKE $${paramIdx})`;
      }
      paramIdx++;
    }

    if (budgetSource) {
      params.push(budgetSource);
      const colName = tableName === 'demand_plan' ? 'funding_source' : 'budget_source';
      query += ` AND ${colName} = $${paramIdx}`;
      paramIdx++;
    }

    if (classification) {
      params.push(classification);
      const colName = tableName === 'demand_plan' ? 'project_classification' : 'classification';
      query += ` AND ${colName} = $${paramIdx}`;
      paramIdx++;
    }

    if (progressStatus) {
      if (tableName === 'active_contracts') {
        params.push(progressStatus);
        query += ` AND progress_status = $${paramIdx}`;
        paramIdx++;
      } else {
        // Other tables do not have progress_status, return empty result if filtered by status
        query += ` AND 1=0`;
      }
    }
    
    query += ` ORDER BY id ASC`;
    
    const rows = await sql.query(query, params);
    
    return Response.json({
      success: true,
      stage,
      count: rows.length,
      data: rows
    });

  } catch (error) {
    console.error("Portfolio API Error:", error);
    return Response.json({ error: "حدث خطأ أثناء تحميل البيانات" }, { status: 500 });
  }
}

// POST a new project from scratch into any specified stage
export async function POST(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return Response.json({ error: "غير مصرح - الرجاء تسجيل الدخول" }, { status: 401 });
  }

  let user = null;
  const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_for_contracts_committee_2026_pha';
  try {
    const token = authHeader.split(' ')[1];
    user = jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return Response.json({ error: "جلسة غير صالحة" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      stage,
      project_name,
      sector,
      owning_department,
      project_owner,
      project_manager,
      budget_source,
      classification,
      weekly_update,
      budget
    } = body;

    if (!stage || !TABLE_WHITELIST[stage]) {
      return Response.json({ error: "مرحلة المشروع غير صالحة" }, { status: 400 });
    }

    if (!project_name || !project_name.trim()) {
      return Response.json({ error: "اسم المشروع مطلوب" }, { status: 400 });
    }

    const tableName = TABLE_WHITELIST[stage];

    // Generate next double precision ID
    const maxIdResult = await sql.query(`SELECT COALESCE(MAX(id), 0) as max_id FROM ${tableName}`);
    const nextId = (parseFloat(maxIdResult[0]?.max_id) || 0) + 1;

    const budgetVal = parseFloat(budget) || 0;
    const nameStr = project_name.trim();
    const sectorStr = sector?.trim() || null;
    const deptStr = owning_department?.trim() || null;
    const ownerStr = project_owner?.trim() || null;
    const mgrStr = project_manager?.trim() || null;
    const sourceStr = budget_source?.trim() || null;
    const classStr = classification?.trim() || null;
    const updateStr = weekly_update?.trim() || null;

    if (tableName === 'demand_plan') {
      await sql`
        INSERT INTO demand_plan (
          id, project_name, sector, owning_department, project_owner, project_manager, 
          funding_source, estimated_value, project_classification, weekly_update, notes
        ) VALUES (
          ${nextId}, ${nameStr}, ${sectorStr}, ${deptStr}, ${ownerStr}, ${mgrStr}, 
          ${sourceStr}, ${budgetVal}, ${classStr}, ${updateStr}, ${updateStr}
        )
      `;
    } else if (tableName === 'tendering_procedures') {
      await sql`
        INSERT INTO tendering_procedures (
          id, project_name, sector, owning_department, project_owner, project_manager, 
          budget_source, classification, weekly_update
        ) VALUES (
          ${nextId}, ${nameStr}, ${sectorStr}, ${deptStr}, ${ownerStr}, ${mgrStr}, 
          ${sourceStr}, ${classStr}, ${updateStr}
        )
      `;
    } else if (tableName === 'awarding') {
      await sql`
        INSERT INTO awarding (
          id, project_name, sector, owning_department, project_owner, project_manager, 
          budget_source, classification, weekly_update
        ) VALUES (
          ${nextId}, ${nameStr}, ${sectorStr}, ${deptStr}, ${ownerStr}, ${mgrStr}, 
          ${sourceStr}, ${classStr}, ${updateStr}
        )
      `;
    } else if (tableName === 'contracting') {
      await sql`
        INSERT INTO contracting (
          id, project_name, sector, owning_department, project_owner, project_manager, 
          budget_source, classification, weekly_update, total_cost
        ) VALUES (
          ${nextId}, ${nameStr}, ${sectorStr}, ${deptStr}, ${ownerStr}, ${mgrStr}, 
          ${sourceStr}, ${classStr}, ${updateStr}, ${budgetVal}
        )
      `;
    } else if (tableName === 'active_contracts') {
      await sql`
        INSERT INTO active_contracts (
          id, project_name, sector, owning_department, project_owner, project_manager, 
          budget_source, classification, notes, total_cost, actual_progress, planned_progress, progress_status
        ) VALUES (
          ${nextId}, ${nameStr}, ${sectorStr}, ${deptStr}, ${ownerStr}, ${mgrStr}, 
          ${sourceStr}, ${classStr}, ${updateStr}, ${budgetVal}, 0, 0, 'على المسار'
        )
      `;
    } else {
      return Response.json({ error: "المرحلة المحددة غير مهيأة لإضافة المشاريع يدويًا" }, { status: 400 });
    }

    // Insert initial comment detailing project creation
    await sql`
      INSERT INTO comments (project_id, stage, comment_text, commenter_name)
      VALUES (${nextId}, ${stage}, 'تم إنشاء وتأسيس المشروع في النظام من الصفر.', ${user.full_name || user.username})
    `;

    return Response.json({
      success: true,
      message: "تم إضافة المشروع الجديد بنجاح",
      id: nextId
    });

  } catch (error) {
    console.error("Create Project API Error:", error);
    return Response.json({ error: "حدث خطأ أثناء إضافة المشروع الجديد في قاعدة البيانات" }, { status: 500 });
  }
}
