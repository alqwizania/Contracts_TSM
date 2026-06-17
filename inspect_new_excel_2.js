const xlsx = require('xlsx');

const excelPath = "D:/Vibecoding/Contracts Committee/محفظة_المشاريع_والعقود 10-6-26 (1).xlsx";
console.log("Loading Excel File...");
const workbook = xlsx.readFile(excelPath);

const targetSheets = ["Frame_Work_Criteria", "Priority_Matrix", "Priority_Calculator", "Phase One ", "Phase Two", "Output"];

for (let name of targetSheets) {
  const sheet = workbook.Sheets[name];
  if (!sheet) {
    console.log(`Sheet "${name}" not found.`);
    continue;
  }
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  console.log(`\n=========================================`);
  console.log(`Sheet: "${name}" | Rows: ${data.length}`);
  
  // Print first 10 rows
  for (let i = 0; i < Math.min(data.length, 10); i++) {
    if (data[i]) {
      console.log(`Row ${i}:`, data[i].slice(0, 15));
    }
  }
}
