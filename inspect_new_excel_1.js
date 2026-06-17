const xlsx = require('xlsx');

const excelPath = "D:\\Vibecoding\\Contracts Committee\\محفظة_المشاريع_والعقود 10-6-26 (1).xlsx";
console.log("Loading Excel File...");
const workbook = xlsx.readFile(excelPath);

console.log("Sheet Names:", workbook.SheetNames);

for (let sheetName of workbook.SheetNames) {
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  console.log(`Sheet: "${sheetName}" | Rows: ${data.length}`);
  
  let headerRowIndex = -1;
  for (let idx = 0; idx < Math.min(data.length, 10); idx++) {
    const row = data[idx];
    if (!row) continue;
    const rowVals = row.map(x => String(x || '').trim());
    if (rowVals.includes('م') || rowVals.includes('المشروع') || rowVals.includes('اسم المشروع') || rowVals.includes('المنافسة/الكراسة') || rowVals.includes('المشروع/الكراسة التشغيلية') || rowVals.includes('النشاط / الخطوة')) {
      headerRowIndex = idx;
      break;
    }
  }
  
  console.log(`  -> Detected Header Row Index: ${headerRowIndex}`);
  if (headerRowIndex >= 0 && data[headerRowIndex]) {
    console.log(`  -> Headers:`, data[headerRowIndex].slice(0, 10).map(h => String(h || '').trim()));
  }
}
