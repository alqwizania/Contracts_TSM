const xlsx = require('xlsx');

const excelPath = "D:/Vibecoding/Contracts Committee/محفظة_المشاريع_والعقود 10-6-26 (1).xlsx";
console.log("Loading Excel File...");
const workbook = xlsx.readFile(excelPath);

const sheetsToInspect = ["Priority_Calculator", "Phase Two", "Output", "Sheet3"];

for (let name of sheetsToInspect) {
  const sheet = workbook.Sheets[name];
  if (!sheet) continue;
  
  console.log(`\n=== Sheet: ${name} ===`);
  // Let's print cells in row 2 (which is index 1 or 2 depending on header)
  // We want to find the columns and their formulas
  let range = sheet['!ref'] || 'A1:P20';
  const decoded = xlsx.utils.decode_range(range);
  
  // Print headers
  const headers = [];
  for (let c = decoded.s.c; c <= decoded.e.c; c++) {
    const cellRef = xlsx.utils.encode_cell({ r: 0, c: c });
    const cell = sheet[cellRef];
    headers.push(cell ? cell.v : `Col_${c}`);
  }
  console.log("Headers:", headers);
  
  // Print first 5 rows with values and formulas
  for (let r = 1; r <= Math.min(decoded.e.r, 5); r++) {
    console.log(`Row ${r}:`);
    for (let c = decoded.s.c; c <= decoded.e.c; c++) {
      const cellRef = xlsx.utils.encode_cell({ r: r, c: c });
      const cell = sheet[cellRef];
      if (cell) {
        console.log(`  ${headers[c]} (${cellRef}): val=${cell.v}, formula=${cell.f || 'none'}`);
      }
    }
  }
}
