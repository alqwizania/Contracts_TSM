const xlsx = require('xlsx');

const excelPath = "D:/Vibecoding/Contracts Committee/محفظة_المشاريع_والعقود 10-6-26 (1).xlsx";
console.log("Loading Excel File...");
const workbook = xlsx.readFile(excelPath);

const targetSheets = [
  " خطة الطلبات",
  "في اجراءات الطرح",
  "  الترسية",
  "التعاقد",
  " قائمة العقود النشطة"
];

const budgetSources = {};
const transformationInitiatives = {};
const classifications = {};
const progressStatuses = {};
const timeStatuses = {};

for (let name of targetSheets) {
  const sheet = workbook.Sheets[name];
  if (!sheet) continue;
  
  let range = sheet['!ref'] || 'A1:Z500';
  const decoded = xlsx.utils.decode_range(range);
  if (decoded.e.r > 500) {
    decoded.e.r = 500;
    range = xlsx.utils.encode_range(decoded);
  }
  
  const data = xlsx.utils.sheet_to_json(sheet, { range, header: 1 });
  const headerRow = data[3] || [];
  
  // Find col indices
  const budgetSourceIdx = headerRow.findIndex(h => String(h || '').includes("مصدر الميزانية") || String(h || '').includes("مصدر التمويل"));
  const transformationIdx = headerRow.findIndex(h => String(h || '').includes("التحول"));
  const classificationIdx = headerRow.findIndex(h => String(h || '').includes("التصنيف"));
  const statusIdx = headerRow.findIndex(h => String(h || '').includes("وضع المشروع") || String(h || '').includes("وضع العقد") || String(h || '').includes("الحالة") || String(h || '').includes("حالة التقدم"));
  const timeStatusIdx = headerRow.findIndex(h => String(h || '').includes("الحالة الزمنية"));
  
  for (let i = 4; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[1] || String(row[1]).trim() === '' || !isNaN(Number(row[1]))) continue;
    
    if (budgetSourceIdx !== -1 && row[budgetSourceIdx]) {
      const val = String(row[budgetSourceIdx]).trim();
      budgetSources[val] = (budgetSources[val] || 0) + 1;
    }
    if (transformationIdx !== -1 && row[transformationIdx]) {
      const val = String(row[transformationIdx]).trim();
      transformationInitiatives[val] = (transformationInitiatives[val] || 0) + 1;
    }
    if (classificationIdx !== -1 && row[classificationIdx]) {
      const val = String(row[classificationIdx]).trim();
      classifications[val] = (classifications[val] || 0) + 1;
    }
    if (statusIdx !== -1 && row[statusIdx]) {
      const val = String(row[statusIdx]).trim();
      progressStatuses[val] = (progressStatuses[val] || 0) + 1;
    }
    if (timeStatusIdx !== -1 && row[timeStatusIdx]) {
      const val = String(row[timeStatusIdx]).trim();
      timeStatuses[val] = (timeStatuses[val] || 0) + 1;
    }
  }
}

console.log("\nBudget Sources Count:", budgetSources);
console.log("\nTransformation Initiatives Count:", transformationInitiatives);
console.log("\nClassifications Count:", classifications);
console.log("\nProgress/Contract Statuses Count:", progressStatuses);
console.log("\nTime Statuses Count:", timeStatuses);
