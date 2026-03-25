const fs = require('fs');
const path = require('path');

const replacements = [
  // Text color adjustments (softer dark grays)
  [/text-gray-900/g, 'text-gray-800'],
  [/text-slate-900/g, 'text-gray-800'],
  [/text-black/g, 'text-gray-800'],
  [/text-\[#000000\]/g, 'text-gray-800'],
  [/text-\[#000\]/g, 'text-gray-800'],

  // Remove dark mode backgrounds if they are dark
  [/dark:bg-gray-900\/?[0-9]* /g, ''],
  [/dark:bg-slate-900\/?[0-9]* /g, ''],
  [/dark:bg-black\/?[0-9]* /g, ''],
  [/dark:bg-slate-950\/?[0-9]* /g, ''],
  [/dark:bg-stone-900\/?[0-9]* /g, ''],
  [/dark:bg-zinc-900\/?[0-9]* /g, ''],
  [/dark:bg-dark-900\/?[0-9]* /g, ''],
  
  // Remove dark borders
  [/dark:border-gray-800/g, ''],
  [/dark:border-slate-800/g, ''],
  [/dark:border-gray-700/g, ''],
  [/dark:border-slate-700/g, ''],

  // Ensure backgrounds are white or soft
  [/bg-gray-900/g, 'bg-white'],
  [/bg-slate-900/g, 'bg-white'],
  [/bg-black/g, 'bg-white'],
  [/bg-slate-950/g, 'bg-white'],

  // Border adjustments
  [/border-border-color/g, 'border-gray-100'],
  [/border-gray-200/g, 'border-gray-100'],
  [/border-slate-200/g, 'border-gray-100'],

  // Sidebar specifics if any
  [/bg-dark-sidebar/g, 'bg-white'],
];

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        walk(filePath);
      }
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.css') || filePath.endsWith('.ts')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let changed = false;
      replacements.forEach(([regex, replacement]) => {
        const newContent = content.replace(regex, replacement);
        if (newContent !== content) {
          content = newContent;
          changed = true;
        }
      });
      if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
      }
    }
  }
}

walk('f:\\Mozhi Aruvi\\Frontend\\src');
