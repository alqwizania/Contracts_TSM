const xlsx = require('xlsx');

const excelPath = "D:\\Vibecoding\\Contracts Committee\\محفظة_المشاريع_والعقود 10-6-26.xlsx";
console.log("Loading Excel File...");
const workbook = xlsx.readFile(excelPath);

console.log("Sheet Names:", workbook.SheetNames);

for (let sheetName of workbook.SheetNames) {
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  console.log(`Sheet: "${sheetName}" | Rows: ${data.length}`);
  
  // Find header row containing 'م' or 'المشروع' or 'اسم المشروع'
  let headerRowIndex = -1;
  for (let idx = 0; idx < data.length; idx++) {
    const row = data[idx];
    if (!row) continue;
    const rowVals = row.map(x => String(x || '').trim());
    if (rowVals.includes('م') || rowVals.includes('المشروع') || rowVals.includes('اسم المشروع') || rowVals.includes('المنافسة/الكراسة')) {
      headerRowIndex = idx;
      break;
    }
  }
  
  console.log(`  -> Detected Header Row Index: ${headerRowIndex}`);
  if (headerRowIndex >= 0) {
    console.log(`  -> First 3 Columns:`, data[headerRowIndex].slice(0, 3).map(h => String(h || '').trim()));
  }
}
