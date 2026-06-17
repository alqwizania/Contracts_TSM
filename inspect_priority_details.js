const xlsx = require('xlsx');

const excelPath = "D:/Vibecoding/Contracts Committee/محفظة_المشاريع_والعقود 10-6-26 (1).xlsx";
console.log("Loading Excel File...");
const workbook = xlsx.readFile(excelPath);

const targetSheets = [
  "Frame_Work_Criteria",
  "Priority_Matrix",
  "Priority_Calculator",
  "Phase One ",
  "Phase Two",
  "Output",
  "Sheet3"
];

for (let name of targetSheets) {
  const sheet = workbook.Sheets[name];
  if (!sheet) {
    console.log(`\nSheet "${name}" not found.`);
    continue;
  }
  
  // Override range if it is extremely large, or check if we can just read first 50 rows
  let range = sheet['!ref'] || 'A1:Z100';
  console.log(`\n=========================================`);
  console.log(`Sheet: "${name}" | Original Range: ${range}`);
  
  // We can force the parser to only read up to row 50
  const decoded = xlsx.utils.decode_range(range);
  if (decoded.e.r > 50) {
    decoded.e.r = 50; // cap row index at 50
    range = xlsx.utils.encode_range(decoded);
    console.log(`Capped range to: ${range}`);
  }
  
  const data = xlsx.utils.sheet_to_json(sheet, { range: range, header: 1 });
  console.log(`Rows read: ${data.length}`);
  
  for (let i = 0; i < Math.min(data.length, 15); i++) {
    if (data[i] && data[i].some(cell => cell !== null && cell !== undefined && cell !== '')) {
      console.log(`Row ${i}:`, data[i].slice(0, 15));
    }
  }
}
