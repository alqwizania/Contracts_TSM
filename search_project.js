const xlsx = require('xlsx');

const excelPath = "D:/Vibecoding/Contracts Committee/محفظة_المشاريع_والعقود 10-6-26 (1).xlsx";
console.log("Loading Excel File...");
const workbook = xlsx.readFile(excelPath);

const sheetNames = ["Priority_Matrix", "Sheet3", "Frame_Work_Criteria"];
for (let name of sheetNames) {
  const sheet = workbook.Sheets[name];
  if (!sheet) {
    console.log(`Sheet ${name} not found!`);
    continue;
  }
  let range = sheet['!ref'] || 'A1:Z100';
  const decoded = xlsx.utils.decode_range(range);
  if (decoded.e.r > 30) {
    decoded.e.r = 30;
    range = xlsx.utils.encode_range(decoded);
  }
  const data = xlsx.utils.sheet_to_json(sheet, { range, header: 1 });
  console.log(`\n=== Sheet: ${name} ===`);
  data.forEach((row, i) => {
    if (row && row.length > 0) {
      console.log(`Row ${i}:`, row);
    }
  });
}
