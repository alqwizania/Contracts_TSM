const xlsx = require('xlsx');

const excelPath = "D:/Vibecoding/Contracts Committee/محفظة_المشاريع_والعقود 10-6-26 (1).xlsx";
console.log("Loading Excel File...");
const workbook = xlsx.readFile(excelPath);

const sheets = {
  "خطة الطلبات": " خطة الطلبات",
  "في اجراءات الطرح": "في اجراءات الطرح",
  "الترسية": "  الترسية",
  "التعاقد": "التعاقد",
  "قائمة العقود النشطة": " قائمة العقود النشطة"
};

for (let label in sheets) {
  const name = sheets[label];
  const sheet = workbook.Sheets[name];
  if (!sheet) {
    console.log(`Sheet "${name}" not found!`);
    continue;
  }
  
  // Cap the range to prevent infinite parsing
  let range = sheet['!ref'] || 'A1:Z500';
  const decoded = xlsx.utils.decode_range(range);
  if (decoded.e.r > 500) {
    decoded.e.r = 500;
    range = xlsx.utils.encode_range(decoded);
  }
  
  const data = xlsx.utils.sheet_to_json(sheet, { range, header: 1 });
  // Header row is index 3 (4th row) based on previous inspection
  const headerIndex = 3;
  let validRowsCount = 0;
  
  for (let i = headerIndex + 1; i < data.length; i++) {
    const row = data[i];
    if (row && row[1] && String(row[1]).trim() !== '' && String(row[1]).trim() !== '0' && isNaN(Number(row[1]))) {
      validRowsCount++;
    }
  }
  
  console.log(`Sheet "${name}" (${label}) has header index ${headerIndex} and ${validRowsCount} valid rows.`);
}
