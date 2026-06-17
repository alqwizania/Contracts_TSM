const xlsx = require('xlsx');
const fs = require('fs');

const excelPath = "D:\\Vibecoding\\Contracts Committee\\محفظة_المشاريع_والعقود 10-6-26.xlsx";
const workbook = xlsx.readFile(excelPath);

const targetSheets = ['Frame_Work_Criteria', 'Priority_Matrix', 'Priority_Calculator'];
let output = "";

for (let sheetName of targetSheets) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    output += `Sheet "${sheetName}" not found!\n`;
    continue;
  }
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  output += `\n=========================================\n`;
  output += `Sheet: "${sheetName}" | Rows: ${data.length}\n`;
  output += `=========================================\n`;
  
  // Print first 30 rows of Frame_Work_Criteria and Priority_Matrix, and first 15 of Priority_Calculator
  const limit = sheetName === 'Priority_Calculator' ? 15 : 30;
  for (let i = 0; i < Math.min(data.length, limit); i++) {
    output += `Row ${i}: ${JSON.stringify(data[i])}\n`;
  }
}

fs.writeFileSync("C:\\Users\\dr_ma\\.gemini\\antigravity-ide\\brain\\fc5c6a91-c85d-42aa-b74a-0c0ccfe3ae19\\scratch\\priority_sheets_details.txt", output, 'utf8');
console.log("Written successfully.");
