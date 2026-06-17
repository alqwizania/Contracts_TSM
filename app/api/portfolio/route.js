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
        topPriorityProjects
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
        classificationStats: normalizedHeiaClass
      });
    }

    // --- 2. Fetch Tabular Lists (with dynamic stages, search, filters) ---
    const stage = searchParams.get('stage');
    if (!stage) {
      return Response.json({ error: "المرحلة غير صالحة" }, { status: 400 });
    }

    if (stage === 'all') {
      const rows = await sql`
        SELECT id, project_name, sector, owning_department, funding_source as budget_source, estimated_value as total_cost, 'خطة الطلبات' as stage_name, project_classification as classification FROM demand_plan
        UNION ALL
        SELECT id, project_name, sector, owning_department, budget_source, 0 as total_cost, 'في الطرح' as stage_name, classification FROM tendering_procedures
        UNION ALL
        SELECT id, project_name, sector, owning_department, budget_source, 0 as total_cost, 'الترسية' as stage_name, classification FROM awarding
        UNION ALL
        SELECT id, project_name, sector, owning_department, budget_source, total_cost, 'التعاقد' as stage_name, classification FROM contracting
        UNION ALL
        SELECT id, project_name, sector, owning_department, budget_source, total_cost, 'عقد نشط' as stage_name, classification FROM active_contracts
        ORDER BY id ASC
      `;
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
    const search = searchParams.get('search') || '';
    
    let query = `SELECT * FROM ${tableName}`;
    const params = [];
    
    // Add searching capability if search text is provided
    if (search.trim()) {
      const searchPattern = `%${search.trim()}%`;
      params.push(searchPattern);
      
      // Determine columns to search based on table schema
      if (tableName === 'demand_plan' || tableName === 'priority_contracts' || tableName === 'active_contracts') {
        query += ` WHERE project_name ILIKE $1 OR sector ILIKE $1 OR owning_department ILIKE $1`;
      } else if (tableName === 'tendering_procedures') {
        query += ` WHERE project_name ILIKE $1 OR sector ILIKE $1 OR procurement_officer ILIKE $1`;
      } else if (tableName === 'awarding' || tableName === 'contracting') {
        query += ` WHERE project_name ILIKE $1 OR sector ILIKE $1 OR project_manager ILIKE $1`;
      } else if (tableName === 'portfolio_plan' || tableName === 'portfolio_details') {
        query += ` WHERE main_activities ILIKE $1 OR leading_entity ILIKE $1`;
      } else {
        query += ` WHERE main_activities ILIKE $1 OR leading_entity ILIKE $1`;
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
