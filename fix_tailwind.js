const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'Frontend', 'src');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
    });
}

walkDir(srcPath, (filePath) => {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf-8');
        let modified = false;

        // Replace specific common instances first
        // text-slate- -> text-slate-500 or text-slate-900 depending on context
        // Instead of complex logic, text-slate- becomes text-slate-600, dark:text-slate- becomes dark:text-slate-300
        // border-slate- -> border-slate-200, dark:border-slate- -> dark:border-slate-700
        // bg-slate- -> bg-slate-50, dark:bg-slate- -> dark:bg-slate-900
        
        const replacements = [
            [/bg-slate-(?=[\s"'])/g, 'bg-slate-50'],
            [/dark:bg-slate-(?=[\s"'\\])/g, 'dark:bg-slate-900'],
            [/dark:bg-slate-\/50/g, 'dark:bg-slate-900/50'],
            [/text-slate-(?=[\s"'])/g, 'text-slate-600'],
            [/dark:text-slate-(?=[\s"'])/g, 'dark:text-slate-300'],
            [/border-slate-(?=[\s"'])/g, 'border-slate-200'],
            [/dark:border-slate-(?=[\s"'])/g, 'dark:border-slate-700'],
            [/hover:bg-slate-(?=[\s"'])/g, 'hover:bg-slate-100'],
            [/dark:hover:bg-slate-(?=[\s"'])/g, 'dark:hover:bg-slate-800'],
            [/dark:hover:bg-slate-\/50/g, 'dark:hover:bg-slate-800/50'],
            [/hover:text-slate-(?=[\s"'])/g, 'hover:text-slate-900'],
            [/dark:hover:text-slate-(?=[\s"'])/g, 'dark:hover:text-slate-100'],
            [/focus:ring-slate-(?=[\s"'])/g, 'focus:ring-slate-300'],
            [/placeholder:text-slate-(?=[\s"'])/g, 'placeholder:text-slate-400']
        ];

        replacements.forEach(([regex, repl]) => {
            if (regex.test(content)) {
                content = content.replace(regex, repl);
                modified = true;
            }
        });

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf-8');
            console.log('Fixed:', filePath);
        }
    }
});
