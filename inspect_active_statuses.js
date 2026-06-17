const xlsx = require('xlsx');

const excelPath = "D:/Vibecoding/Contracts Committee/محفظة_المشاريع_والعقود 10-6-26 (1).xlsx";
console.log("Loading Excel File...");
const workbook = xlsx.readFile(excelPath);

const sheetName = " قائمة العقود النشطة";
const sheet = workbook.Sheets[sheetName];

let range = sheet['!ref'] || 'A1:Z500';
const decoded = xlsx.utils.decode_range(range);
if (decoded.e.r > 500) {
  decoded.e.r = 500;
  range = xlsx.utils.encode_range(decoded);
}

const data = xlsx.utils.sheet_to_json(sheet, { range, header: 1 });
const headerRow = data[3] || [];

const progressIdx = headerRow.findIndex(h => String(h || '').trim() === "حالة التقدم");
const timeStatusIdx = headerRow.findIndex(h => String(h || '').trim() === "الحالة الزمنية للعقد");
const conditionIdx = headerRow.findIndex(h => String(h || '').trim() === "وضع المشروع");

const progressVals = {};
const timeVals = {};
const conditionVals = {};

for (let i = 4; i < data.length; i++) {
  const row = data[i];
  if (!row || !row[1] || String(row[1]).trim() === '' || !isNaN(Number(row[1]))) continue;
  
  if (progressIdx !== -1 && row[progressIdx]) {
    const val = String(row[progressIdx]).trim();
    progressVals[val] = (progressVals[val] || 0) + 1;
  }
  if (timeStatusIdx !== -1 && row[timeStatusIdx]) {
    const val = String(row[timeStatusIdx]).trim();
    timeVals[val] = (timeVals[val] || 0) + 1;
  }
  if (conditionIdx !== -1 && row[conditionIdx]) {
    const val = String(row[conditionIdx]).trim();
    conditionVals[val] = (conditionVals[val] || 0) + 1;
  }
}

console.log("Unique Values in 'حالة التقدم':", progressVals);
console.log("Unique Values in 'الحالة الزمنية للعقد':", timeVals);
console.log("Unique Values in 'وضع المشروع':", conditionVals);
