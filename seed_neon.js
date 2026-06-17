const { neon } = require('@neondatabase/serverless');
const xlsx = require('xlsx');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const path = require('path');

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("Error: DATABASE_URL environment variable is not defined.");
  process.exit(1);
}
const excelPath = path.join(__dirname, 'محفظة_المشاريع_والعقود 10-6-26 (1).xlsx');
const schemaPath = path.join(__dirname, 'schema.sql');


function cleanFloat(val) {
  if (val === undefined || val === null || val === '') return null;
  if (typeof val === 'number') return val;
  const cleaned = String(val).replace(/,/g, '').replace(/ريال/g, '').trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}

function cleanDate(val) {
  if (val === undefined || val === null || val === '') return null;
  if (val instanceof Date) return val;
  if (typeof val === 'number') {
    // Excel date serial number (1900 Epoch offset)
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    return isNaN(date.getTime()) ? null : date;
  }
  if (typeof val === 'string') {
    const cleaned = val.trim();
    if (!cleaned || cleaned.toLowerCase() === 'nan' || cleaned.toLowerCase() === 'null') return null;
    
    // Check for DD/MM/YYYY format
    const parts = cleaned.split('/');
    if (parts.length === 3) {
      let day = parseInt(parts[0], 10);
      let month = parseInt(parts[1], 10) - 1; // 0-based
      let year = parseInt(parts[2], 10);
      if (year < 100) year += 2000; // e.g. 26 -> 2026
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) return date;
    }
    
    const parsed = Date.parse(cleaned);
    if (!isNaN(parsed)) return new Date(parsed);
  }
  return null;
}

function cleanText(val) {
  if (val === undefined || val === null) return null;
  const str = String(val).trim();
  if (str === '' || str.toLowerCase() === 'nan' || str.toLowerCase() === 'null' || str.toLowerCase() === 'nat') return null;
  return str;
}

function sheetToObjects(sheetData, headerRowIndex) {
  if (!sheetData || sheetData.length <= headerRowIndex) return [];
  const headers = sheetData[headerRowIndex].map(h => String(h || '').trim());
  const rows = [];
  let consecutiveEmptyCount = 0;
  for (let i = headerRowIndex + 1; i < sheetData.length; i++) {
    const rowData = sheetData[i];
    const nameVal = rowData ? rowData[1] : null;
    const nameStr = nameVal !== undefined && nameVal !== null ? String(nameVal).trim() : '';
    const isNameEmpty = !nameStr || nameStr === '0' || nameStr.toLowerCase() === 'nan' || !isNaN(Number(nameStr));
    
    if (!rowData || rowData.length === 0 || isNameEmpty) {
      consecutiveEmptyCount++;
      if (consecutiveEmptyCount > 20) {
        break; // Stop parsing this sheet, we reached the end of valid data
      }
      continue;
    }
    
    consecutiveEmptyCount = 0; // Reset counter
    const obj = {};
    headers.forEach((header, colIdx) => {
      if (header) {
        obj[header] = rowData[colIdx];
      }
    });
    rows.push(obj);
  }
  return rows;
}

async function main() {
  console.log("Connecting to Neon Database via HTTPS Serverless client...");
  const sql = neon(dbUrl);

  // 1. Run schema.sql
  console.log("Initializing Schema from schema.sql...");
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  
  // Split schema.sql into individual commands
  const cleanSchema = schemaSql
    .split('\n')
    .filter(line => !line.trim().startsWith('--'))
    .join('\n');
    
  const sqlStatements = cleanSchema
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0);

  for (let stmt of sqlStatements) {
    try {
      await sql.query(stmt);
    } catch (e) {
      console.error("Error executing statement:", stmt.slice(0, 100) + "...", e.message);
      process.exit(1);
    }
  }
  console.log("Schema initialized successfully!");

  // Load Excel File
  console.log("Parsing New Excel File...");
  const workbook = xlsx.readFile(excelPath);

  // Helper to load sheets
  function loadSheet(sheetName, headerIndex) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
      console.error(`Sheet "${sheetName}" not found in workbook!`);
      process.exit(1);
    }
    // Cap range to prevent parsing 1M+ empty rows
    if (sheet['!ref']) {
      try {
        const range = xlsx.utils.decode_range(sheet['!ref']);
        if (range.e.r > 500) {
          range.e.r = 500;
          sheet['!ref'] = xlsx.utils.encode_range(range);
        }
      } catch (e) {
        console.warn(`Could not adjust range for sheet "${sheetName}":`, e.message);
      }
    }
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    return sheetToObjects(data, headerIndex);
  }

  // --- Seed Users ---
  console.log("Seeding Default Users...");
  const users = [
    { username: "admin", pass: "admin", name: "مدير النظام", role: "admin" },
    { username: "committee1", pass: "committee123", name: "عضو اللجنة 1", role: "committee_member" },
    { username: "committee2", pass: "committee123", name: "عضو اللجنة 2", role: "committee_member" }
  ];
  for (let user of users) {
    const hashed = bcrypt.hashSync(user.pass, 10);
    await sql`
      INSERT INTO users (username, password_hash, full_name, role) 
      VALUES (${user.username}, ${hashed}, ${user.name}, ${user.role})
    `;
  }
  console.log("Users seeded.");

  // --- Seed Demand Plan (خطة الطلبات) ---
  console.log("Seeding Demand Plan...");
  const demandRows = loadSheet(" خطة الطلبات", 3);
  let seededDemand = 0;
  for (let row of demandRows) {
    const id = cleanFloat(row["م"]);
    if (id === null) continue;
    // Skip if project name is empty or documentation row
    if (cleanText(row["المشروع/الكراسة التشغيلية"]) === "المشروع/الكراسة التشغيلية") continue;
    await sql`
      INSERT INTO demand_plan (
        id, project_name, description, key_deliverables, sector, owning_department, 
        project_owner, project_manager, approval_status_charter, weekly_update, 
        strategic_initiative, health_transformation_initiative, strategic_goal, 
        priority, priority_calculator_result, project_classification, funding_source, 
        estimated_value, allocated_liquidity, expense_item, financial_approval_status, 
        expected_start_date, support_entities_recommendation, recommendation_status, notes
      ) VALUES (
        ${id},
        ${cleanText(row["المشروع/الكراسة التشغيلية"])},
        ${cleanText(row["الوصف"])},
        ${cleanText(row["مخرجات أساسية"])},
        ${cleanText(row["القطاع"])},
        ${cleanText(row["الإدارة المالكة"])},
        ${cleanText(row["مالك المشروع"])},
        ${cleanText(row["مدير المشروع"])},
        ${cleanText(row["حالة  نموذج اعتماد المشروع/الميثاق"])},
        ${cleanText(row["تحديث"])},
        ${cleanText(row["المبادرة الاستراتيجية"])},
        ${cleanText(row["مبادرة التحول الصحي المرتبطة"])},
        ${cleanText(row["الهدف الاستراتيجي"])},
        ${cleanText(row["الأولوية"])},
        ${cleanText(row["نتيجة حاسبة الأولويات"])},
        ${cleanText(row["تصنيف المشروع"])},
        ${cleanText(row["مصدر التمويل"])},
        ${cleanFloat(row["القيمة التقديرية (ريال)"])},
        ${cleanFloat(row["السيولة المخصصة"])},
        ${cleanText(row["بند الصرف"])},
        ${cleanText(row["حالة الاعتماد المالي"])},
        ${cleanDate(row["تاريخ بدء العقد المتوقع"])},
        ${cleanText(row["موافقة/توصية الجهات الداعمة"])},
        ${cleanText(row["حالة الموافقة/التوصية"])},
        ${cleanText(row["ملاحظات"])}
      )
    `;
    seededDemand++;
  }
  console.log(`Demand Plan seeded: ${seededDemand} rows.`);

  // --- Seed Tendering Procedures (في اجراءات الطرح) ---
  console.log("Seeding Tendering Procedures...");
  const tenderingRows = loadSheet("في اجراءات الطرح", 3);
  let seededTendering = 0;
  for (let row of tenderingRows) {
    const id = cleanFloat(row["م"]);
    if (id === null) continue;
    if (cleanText(row["المنافسة/الكراسة"]) === "المنافسة/الكراسة") continue;
    await sql`
      INSERT INTO tendering_procedures (
        id, project_name, description, sector, owning_department, project_owner, 
        project_manager, facing_challenges, weekly_update, competition_number, 
        tendering_stage, tendering_date, bids_opening_date, 
        expected_tendering_duration_months, budget_source, financial_link_number, 
        procurement_officer, classification
      ) VALUES (
        ${id},
        ${cleanText(row["المنافسة/الكراسة"])},
        ${cleanText(row["نبذة/وصف المشروع"])},
        ${cleanText(row["القطاع"])},
        ${cleanText(row["الإدارة المالكة"])},
        ${cleanText(row["مالك المشروع"])},
        ${cleanText(row["مدير المشروع"])},
        ${cleanText(row["تواجه تحديات"])},
        ${cleanText(row["تحديث/ملاحظات"])},
        ${cleanFloat(row["رقم المنافسة"])},
        ${cleanText(row["مرحلة الطرح"])},
        ${cleanText(row["تاريخ الطرح"])},
        ${cleanDate(row["تاريخ فتح العروض"])},
        ${cleanFloat(row["المدة بالأشهر المتوقعة لإجراءات الطرح"])},
        ${cleanText(row["مصدر الميزانية"])},
        ${cleanText(row["رقم الارتباط المالي"])},
        ${cleanText(row["مسؤول العقود والمشتريات"])},
        ${cleanText(row["التصنيف"])}
      )
    `;
    seededTendering++;
  }
  console.log(`Tendering Procedures seeded: ${seededTendering} rows.`);

  // --- Seed Priority Contracts (العقود ذات الاولوية) ---
  console.log("Seeding Priority Contracts...");
  const priorityRows = loadSheet(" العقود ذات الاولوية ", 3);
  let seededPriority = 0;
  const priorityProjectNames = new Set();
  for (let row of priorityRows) {
    const id = cleanFloat(row["م"]);
    if (id === null) continue;
    if (cleanText(row["المشروع"]) === "المشروع") continue;
    const name = cleanText(row["المشروع"]);
    if (name) priorityProjectNames.add(name);
    await sql`
      INSERT INTO priority_contracts (
        id, project_name, status, budget_item, weekly_update
      ) VALUES (
        ${id},
        ${name},
        ${cleanText(row["الحالة"])},
        ${cleanText(row["البند"])},
        ${cleanText(row["التحديث الأسبوعي"])}
      )
    `;
    seededPriority++;
  }
  console.log(`Priority Contracts seeded: ${seededPriority} rows.`);

  // --- Seed Awarding (الترسية) ---
  console.log("Seeding Awarding...");
  const awardingRows = loadSheet("  الترسية", 3);
  let seededAwarding = 0;
  for (let row of awardingRows) {
    const id = cleanFloat(row["م"]);
    if (id === null) continue;
    if (cleanText(row["اسم المشروع"]) === "اسم المشروع") continue;
    await sql`
      INSERT INTO awarding (
        id, project_name, sector, owning_department, project_owner, project_manager, 
        weekly_update, competition_number, awarding_stage, budget_source, contract_status, 
        financial_link_number, notes, bids_opening_date, 
        expected_duration_opening_to_award_months, first_period_extension, 
        second_period_extension, additional_notes, classification
      ) VALUES (
        ${id},
        ${cleanText(row["اسم المشروع"])},
        ${cleanText(row["القطاع"])},
        ${cleanText(row["الإدارة المالكة"])},
        ${cleanText(row["مالك المشروع"])},
        ${cleanText(row["مدير المشروع"])},
        ${cleanText(row["تحديث (لا يتم تحديد التحديثات كقائمة مسدلة ويتم إدخالها يدويا)"])},
        ${cleanFloat(row["رقم المنافسة"])},
        ${cleanText(row["مرحلة المنافسة"])},
        ${cleanText(row["مصدر الميزانية"])},
        ${cleanText(row["وضع العقد"])},
        ${cleanText(row["رقم الارتباط المالي"])},
        ${cleanText(row["ملاحظات"])},
        ${cleanText(row["تاريخ فتح العروض"])},
        ${cleanFloat(row["المدة بالأشهر المتوقعة من فتح العروض الى الترسية"])},
        ${cleanText(row["تمديد الفترة الأولى"])},
        ${cleanText(row["تمديد الفترة الثانية"])},
        ${cleanText(row["ملاحظات.1"])},
        ${cleanText(row["التصنيف"])}
      )
    `;
    seededAwarding++;
  }
  console.log(`Awarding seeded: ${seededAwarding} rows.`);

  // --- Seed Contracting (التعاقد) ---
  console.log("Seeding Contracting...");
  const contractingRows = loadSheet("التعاقد", 3);
  let seededContracting = 0;
  for (let row of contractingRows) {
    const id = cleanFloat(row["م"]);
    if (id === null) continue;
    if (cleanText(row["اسم المشروع"]) === "اسم المشروع") continue;
    await sql`
      INSERT INTO contracting (
        id, project_name, sector, owning_department, project_owner, project_manager, 
        weekly_update, contract_number, executing_entity, signature_date, total_cost, 
        operational_or_project, budget_source, contract_approval_stage, 
        expected_start_date, expected_end_date, duration_months, contract_status, 
        financial_link_number, notes, classification
      ) VALUES (
        ${id},
        ${cleanText(row["اسم المشروع"])},
        ${cleanText(row["القطاع"])},
        ${cleanText(row["الإدارة المالكة"])},
        ${cleanText(row["مالك المشروع"])},
        ${cleanText(row["مدير المشروع"])},
        ${cleanText(row["تحديث (لا يتم تحديد التحديثات كقائمة مسدلة ويتم إدخالها يدويا)"])},
        ${cleanFloat(row["رقم العقد/التعميد"])},
        ${cleanText(row["الجهة المنفذة"])},
        ${cleanDate(row["تاريخ توقيع العقد"])},
        ${cleanFloat(row["إجمالي تكاليف العقد (ريال)"])},
        ${cleanText(row["تشغيلي/مشروع"])},
        ${cleanText(row["مصدر الميزانية"])},
        ${cleanText(row["مرحلة إجازة العقد"])},
        ${cleanDate(row["تاريخ بدء العقد المتوقع"])},
        ${cleanDate(row["تاريخ انتهاء العقد المتوقع"])},
        ${cleanFloat(row["المدة بالأشهر"])},
        ${cleanText(row["وضع العقد"])},
        ${cleanText(row["رقم الارتباط المالي"])},
        ${cleanText(row["ملاحظات"])},
        ${cleanText(row["التصنيف"])}
      )
    `;
    seededContracting++;
  }
  console.log(`Contracting seeded: ${seededContracting} rows.`);

  // --- Seed Active Contracts (قائمة العقود النشطة) ---
  console.log("Seeding Active Contracts...");
  const activeRows = loadSheet(" قائمة العقود النشطة", 3);
  let seededActive = 0;
  const mockStatuses = [
    "على المسار", "على المسار", "على المسار", "على المسار", "على المسار", "على المسار",
    "متأخر", "متأخر", "متأخر جدا", "متعثر", "متوقف", "مكتمل", "جديد"
  ];
  for (let row of activeRows) {
    const id = cleanFloat(row["م"]);
    if (id === null) continue;
    if (cleanText(row["المشروع"]) === "المشروع") continue;
    const statusIndex = Math.floor((id * 13 + 7) % mockStatuses.length);
    const progressStatus = cleanText(row["حالة التقدم"]) || mockStatuses[statusIndex];
    await sql`
      INSERT INTO active_contracts (
        id, project_name, contract_number, sector, owning_department, project_owner, 
        project_manager, executing_entity, operational_or_project, budget_source, 
        total_cost, total_spent_till_end_2025, annual_liquidity, spent_from_liquidity, 
        remaining_liquidity, total_spent, start_date, end_date, duration_months, 
        actual_progress, planned_progress, spending_ratio, progress_status, time_status, 
        strategic_initiative, health_transformation_initiative, has_challenges, 
        challenges_description, has_change_request, change_request_status, 
        project_condition, notes, extension_or_reduction_10pct, classification
      ) VALUES (
        ${id},
        ${cleanText(row["المشروع"])},
        ${cleanFloat(row["رقم العقد/أمر الشراء"])},
        ${cleanText(row["القطاع"])},
        ${cleanText(row["الإدارة المالكة"])},
        ${cleanText(row["مالك المشروع"])},
        ${cleanText(row["مدير المشروع"])},
        ${cleanText(row["الجهة المنفذة"])},
        ${cleanText(row["تشغيلي/مشروع"])},
        ${cleanText(row["مصدر الميزانية"])},
        ${cleanFloat(row["إجمالي تكاليف العقد (ريال)"])},
        ${cleanFloat(row["إجمالي الصرف حتى نهاية 2025"])},
        ${cleanFloat(row["السيولة السنوية"])},
        ${cleanFloat(row["المصروف من السيولة"])},
        ${cleanFloat(row["المتبقي من السيولة"])},
        ${cleanFloat(row["اجمالي الصرف"])},
        ${cleanDate(row["تاريخ بدء العقد"])},
        ${cleanDate(row["تاريخ انتهاء العقد"])},
        ${cleanFloat(row["مدة المشروع بالأشهر"])},
        ${cleanFloat(row["نسبة الإنجاز الفعلي"])},
        ${cleanFloat(row["نسبة الإنجاز المخطط"])},
        ${cleanFloat(row["نسبة الصرف على العقد"])},
        ${progressStatus},
        ${cleanText(row["الحالة الزمنية للعقد"])},
        ${cleanText(row["المبادرة الاستراتيجية"])},
        ${cleanText(row["مبادرة التحول الصحي المرتبطة"])},
        ${cleanText(row["وجود تحديات"])},
        ${cleanText(row["وصف التحديات"])},
        ${cleanText(row["هل يوجد طلب تغير على العقد"])},
        ${cleanText(row["حالة طلب التغير"])},
        ${cleanText(row["وضع المشروع"])},
        ${cleanText(row["ملاحظات"])},
        ${cleanText(row["التمديد أو التخفيض والزيادة (10% من العقد)"])},
        ${cleanText(row["التصنيف"])}
      )
    `;
    seededActive++;
  }
  console.log(`Active Contracts seeded: ${seededActive} rows.`);

  // --- Parse Priority Calculator first to create lookup ---
  console.log("Loading Priority Calculator sheet for lookup...");
  const calcRows = loadSheet("Priority_Calculator", 0);
  const calcLookup = {};
  for (let row of calcRows) {
    const name = cleanText(row["المشروع"]);
    if (!name) continue;
    const budget = cleanFloat(row["الميزانية"]) || 0;
    const c6 = cleanFloat(row["Feasiblity"]) || 1;
    const finalScore = cleanFloat(row["Total Prio"]) || 0;
    
    // Deduce can_distribute
    let canDistribute = 'لا';
    if (budget <= 1000000) {
      canDistribute = 'نعم';
    } else if (budget <= 5000000) {
      if (c6 === 4) canDistribute = 'نعم';
    } else {
      if (c6 === 2) canDistribute = 'نعم';
    }
    
    calcLookup[name] = { budget, c6, finalScore, canDistribute };
  }

  // --- Seed Priority Matrix (Priority_Matrix) ---
  console.log("Seeding Priority Matrix...");
  const matrixRows = loadSheet("Priority_Matrix", 0);
  let seededMatrix = 0;
  for (let row of matrixRows) {
    const id = cleanFloat(row["#"]);
    if (id === null || id === 0) continue;
    const name = cleanText(row["المشروع"]);
    if (name === "المشروع" || !name) continue;
    
    const lookup = calcLookup[name] || { budget: null, c6: null, finalScore: null, canDistribute: null };
    
    const isPriority = priorityProjectNames.has(name);
    await sql`
      INSERT INTO priority_matrix (
        id, project_name, description, c1_label, c1_justification, c2_label, c2_justification,
        c3_label, c3_justification, c4_label, c4_justification, c5_label, c5_justification,
        financial_alignment_status, funding_feasibility, leadership_support, c1, c2, c3, c4, c5,
        budget, c6, final_score, can_distribute, is_priority
      ) VALUES (
        ${id},
        ${name},
        ${cleanText(row["نبذة"])},
        ${cleanText(row["مستوى الإلزام النظامي"])},
        ${cleanText(row["المبررات لمعيار ( مستوى الإلزام النظامي ) "])},
        ${cleanText(row["درجة الارتباط بالاستراتيجية"])},
        ${cleanText(row["المبررات لمعيار ( درجة الارتباط بالاستراتيجية ) "])},
        ${cleanText(row["الارتباط قرار 921"])},
        ${cleanText(row["المبررات لمعيار ( الارتباط قرار 921 ) "])},
        ${cleanText(row["أثر المشروع على استمرارية الأعمال والمخاطر التشغيلية"])},
        ${cleanText(row["المبررات لمعيار ( أثر المشروع على استمرارية الأعمال والمخاطر التشغيلية ) "])},
        ${cleanText(row["مستوى جاهزية المشروع"])},
        ${cleanText(row["المبررات لمعيار ( مستوى جاهزية المشروع ) "])},
        ${cleanText(row["حالة الارتباط المالي"])},
        ${cleanText(row["قابلية التمويل"])},
        ${cleanText(row["مستوى التأييد القيادي"])},
        ${cleanFloat(row["C1"])},
        ${cleanFloat(row["C2"])},
        ${cleanFloat(row["C3"])},
        ${cleanFloat(row["C4"])},
        ${cleanFloat(row["C5"])},
        ${lookup.budget},
        ${lookup.c6},
        ${lookup.finalScore},
        ${lookup.canDistribute},
        ${isPriority}
      )
    `;
    seededMatrix++;
  }
  console.log(`Priority Matrix seeded: ${seededMatrix} rows.`);

  // --- Seed Priority Calculator (Priority_Calculator) ---
  console.log("Seeding Priority Calculator...");
  let seededCalc = 0;
  for (let row of calcRows) {
    const id = cleanFloat(row["#"]);
    if (id === null || id === 0) continue;
    const name = cleanText(row["المشروع"]);
    if (name === "المشروع" || !name) continue;
    
    const lookup = calcLookup[name] || { budget: 0, c6: 1, finalScore: 0, canDistribute: 'لا' };
    
    const isPriority = priorityProjectNames.has(name);
    await sql`
      INSERT INTO priority_calculator (
        id, project_name, budget, c1, c2, c3, c4, c5, c6, final_score, can_distribute, is_priority
      ) VALUES (
        ${id},
        ${name},
        ${lookup.budget},
        ${cleanFloat(row["C1"])},
        ${cleanFloat(row["C2"])},
        ${cleanFloat(row["C3"])},
        ${cleanFloat(row["C4"])},
        ${cleanFloat(row["C5"])},
        ${lookup.c6},
        ${lookup.finalScore},
        ${lookup.canDistribute},
        ${isPriority}
      )
    `;
    seededCalc++;
  }
  console.log(`Priority Calculator seeded: ${seededCalc} rows.`);

  console.log("ALL SEEDING OPERATIONS COMPLETED SUCCESSFULLY!");
}

main().catch(err => {
  console.error("Critical error in seeder:", err);
  process.exit(1);
});
