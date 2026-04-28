const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const syllabusDir = path.join(__dirname, 'syllabus');
const files = fs.readdirSync(syllabusDir).filter(f => f.endsWith('.xlsx') && !f.startsWith('~$'));

files.forEach(file => {
  console.log('File:', file);
  const filePath = path.join(syllabusDir, file);
  const workbook = xlsx.readFile(filePath);
  console.log('Sheets:', workbook.SheetNames);
  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    console.log(`Sheet [${sheetName}] first row:`, data[0]);
  });
  console.log('---');
});
