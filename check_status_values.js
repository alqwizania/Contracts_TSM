const xlsx = require('xlsx');

const excelPath = "D:/Vibecoding/Contracts Committee/محفظة_المشاريع_والعقود 10-6-26 (1).xlsx";
console.log("Loading Excel File...");
const workbook = xlsx.readFile(excelPath);

const targetSheets = {
  "خطة الطلبات": " خطة الطلبات",
  "في اجراءات الطرح": "في اجراءات الطرح",
  "الترسية": "  الترسية",
  "التعاقد": "التعاقد",
  "قائمة العقود النشطة": " قائمة العقود النشطة"
};

for (let label in targetSheets) {
  const name = targetSheets[label];
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
  
  console.log(`\n=================== Sheet: ${name} ===================`);
  console.log("Headers:", headerRow.slice(0, 25));
  
  // Find classification and status column indexes
  const classIdx = headerRow.findIndex(h => String(h || '').trim() === "التصنيف" || String(h || '').trim() === "تصنيف المشروع");
  const budgetIdx = headerRow.findIndex(h => String(h || '').includes("تكاليف العقد") || String(h || '').includes("الميزانية") || String(h || '').includes("القيمة التقديرية") || String(h || '').includes("المصروف") || String(h || '').includes("القيمة"));
  
  // Let's print unique values for columns that might contain status
  const possibleStatusCols = [];
  headerRow.forEach((h, idx) => {
    const s = String(h || '').trim();
    if (s.includes("الحالة") || s.includes("وضع") || s.includes("مرحلة") || s.includes("التقدم") || s.includes("رأي")) {
      possibleStatusCols.push({ header: s, idx: idx });
    }
  });
  
  const classVals = new Set();
  const statusCounts = {};
  
  for (let i = 4; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[1] || String(row[1]).trim() === '' || !isNaN(Number(row[1]))) continue;
    
    if (classIdx !== -1 && row[classIdx]) classVals.add(String(row[classIdx]).trim());
    
    possibleStatusCols.forEach(col => {
      if (row[col.idx]) {
        const val = String(row[col.idx]).trim();
        if (!statusCounts[col.header]) statusCounts[col.header] = {};
        statusCounts[col.header][val] = (statusCounts[col.header][val] || 0) + 1;
      }
    });
  }
  
  console.log("Unique Classifications:", Array.from(classVals));
  console.log("Status Columns Counts:", statusCounts);
}
