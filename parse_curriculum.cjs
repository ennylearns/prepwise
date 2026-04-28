const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const syllabusDir = path.join(__dirname, 'syllabus');
const files = fs.readdirSync(syllabusDir).filter(f => f.endsWith('.xlsx') && !f.startsWith('~$'));

const output = {
  subjects: [],
  lessons: []
};

files.forEach(file => {
  const filePath = path.join(syllabusDir, file);
  const workbook = xlsx.readFile(filePath);
  
  if (workbook.SheetNames.includes('Syllabus')) {
    const sheet = workbook.Sheets['Syllabus'];
    const data = xlsx.utils.sheet_to_json(sheet);
    
    let currentSubject = "";
    
    data.forEach(row => {
      const subject = row.subject || row.Subject;
      const title = row.title || row.tilte || row.Title;
      const order = row.Order || row.order;
      
      if (subject && subject !== currentSubject) {
        if (!output.subjects.find(s => s.name === subject)) {
          output.subjects.push({ name: subject, order: output.subjects.length + 1 });
        }
        currentSubject = subject;
      }
      
      if (title) {
        output.lessons.push({
          subjectName: subject || currentSubject,
          title: title,
          order: parseInt(order) || output.lessons.filter(l => l.subjectName === (subject || currentSubject)).length + 1
        });
      }
    });
  }
});

fs.writeFileSync(path.join(__dirname, 'parsed_syllabus.json'), JSON.stringify(output, null, 2));
console.log('Parsed successfully! Written to parsed_syllabus.json');
