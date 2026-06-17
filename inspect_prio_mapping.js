const xlsx = require('xlsx');

const excelPath = "D:/Vibecoding/Contracts Committee/محفظة_المشاريع_والعقود 10-6-26 (1).xlsx";
console.log("Loading Excel File...");
const workbook = xlsx.readFile(excelPath);

// We will load Priority_Matrix (which has the textual ratings) and Sheet3 / Phase Two (which have the C6 and Final score)
const matrixSheet = workbook.Sheets["Priority_Matrix"];
const matrixRange = matrixSheet['!ref'] || 'A1:U30';
const matrixData = xlsx.utils.sheet_to_json(matrixSheet, { range: matrixRange });

const phaseTwoSheet = workbook.Sheets["Phase Two"];
const p2Range = phaseTwoSheet['!ref'] || 'A1:O30';
const p2Data = xlsx.utils.sheet_to_json(phaseTwoSheet, { range: p2Range });

const sheet3Sheet = workbook.Sheets["Sheet3"];
const s3Range = sheet3Sheet['!ref'] || 'A1:J30';
const s3Data = xlsx.utils.sheet_to_json(sheet3Sheet, { range: s3Range });

console.log("\n--- Project comparison ---");
for (let p2Row of p2Data) {
  const name = p2Row["المشروع"];
  if (!name) continue;
  
  // Find in matrix data
  const matrixRow = matrixData.find(r => r["المشروع"] === name);
  const s3Row = s3Data.find(r => r["المشروع"] === name);
  
  console.log(`\nProject: ${name}`);
  console.log(`  Budget (P2): ${p2Row["الميزانية"]}`);
  console.log(`  Matrix Fields:`);
  if (matrixRow) {
    console.log(`    حالة الارتباط المالي: ${matrixRow["حالة الارتباط المالي"]}`);
    console.log(`    قابلية التمويل: ${matrixRow["قابلية التمويل"]}`);
    console.log(`    مستوى التأييد القيادي: ${matrixRow["مستوى التأييد القيادي"] || matrixRow["مستوى التأييد القيادي "] || 'N/A'}`);
  } else {
    console.log(`    Not found in Priority_Matrix`);
  }
  console.log(`  Scores:`);
  console.log(`    Phase One Weight (P2): ${p2Row["وزن المرحلة الأولى"]}`);
  console.log(`    C6 (Phase Two): ${p2Row["C6"]}`);
  console.log(`    Final Weight (Phase Two): ${p2Row["الوزن النهائي"]}`);
  if (s3Row) {
    console.log(`    C6 (Sheet3): ${s3Row["C6"]}`);
    console.log(`    Final Weight (Sheet3): ${s3Row["الوزن النهائي"]}`);
  }
}
