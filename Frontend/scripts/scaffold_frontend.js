const fs = require('fs');
const path = require('path');

const srcApp = "f:\\Uki\\Final Project\\Mozhi Aruvi\\Frontend\\src\\app";

const structure = {
  'student': {
    'layout.tsx': `import React from 'react';\n\nexport default function StudentLayout({ children }: { children: React.ReactNode }) {\n  return (\n    <div className="flex min-h-screen bg-gray-50">\n      {/* Sidebar Component Here */}\n      <main className="flex-1 flex flex-col">\n        {/* Topbar Component Here */}\n        <div className="p-6 flex-1">\n          {children}\n        </div>\n      </main>\n    </div>\n  );\n}`,
    'dashboard': { 'page.tsx': 'export default function StudentDashboard() { return <div>Student Dashboard</div>; }' },
    'lessons': { 'page.tsx': 'export default function StudentLessons() { return <div>Student Lessons</div>; }', '[id]': { 'page.tsx': 'export default function LessonDetail() { return <div>Lesson Detail</div>; }' } },
    'progress': { 'page.tsx': 'export default function StudentProgress() { return <div>Student Progress</div>; }' },
    'vocabulary': { 'page.tsx': 'export default function StudentVocabulary() { return <div>Student Vocabulary</div>; }' },
    'tutors': { 'page.tsx': 'export default function StudentTutors() { return <div>Student Tutors Browsing</div>; }', '[id]': { 'page.tsx': 'export default function TutorDetail() { return <div>Tutor Detail</div>; }' } },
    'events': { 'page.tsx': 'export default function StudentEvents() { return <div>Student Events</div>; }' },
    'premium': { 'page.tsx': 'export default function StudentPremium() { return <div>Premium Status</div>; }' },
    'settings': { 'page.tsx': 'export default function StudentSettings() { return <div>Student Settings</div>; }' },
  },
  'tutor': {
    'layout.tsx': `import React from 'react';\n\nexport default function TutorLayout({ children }: { children: React.ReactNode }) {\n  return (\n    <div className="flex min-h-screen bg-gray-50">\n      {/* Sidebar Component Here */}\n      <main className="flex-1 flex flex-col">\n        {/* Topbar Component Here */}\n        <div className="p-6 flex-1">\n          {children}\n        </div>\n      </main>\n    </div>\n  );\n}`,
    'dashboard': { 'page.tsx': 'export default function TutorDashboard() { return <div>Tutor Dashboard</div>; }' },
    'questions': { 'page.tsx': 'export default function TutorQuestions() { return <div>Tutor Questions</div>; }' },
    'schedule': { 'page.tsx': 'export default function TutorSchedule() { return <div>Tutor Schedule</div>; }' },
    'events': { 'page.tsx': 'export default function TutorEvents() { return <div>Tutor Events</div>; }' },
    'profile': { 'page.tsx': 'export default function TutorProfile() { return <div>Tutor Profile</div>; }' },
    'settings': { 'page.tsx': 'export default function TutorSettings() { return <div>Tutor Settings</div>; }' },
  },
  'admin': {
    'layout.tsx': `import React from 'react';\n\nexport default function AdminLayout({ children }: { children: React.ReactNode }) {\n  return (\n    <div className="flex min-h-screen bg-gray-50">\n      {/* Sidebar Component Here */}\n      <main className="flex-1 flex flex-col">\n        {/* Topbar Component Here */}\n        <div className="p-6 flex-1">\n          {children}\n        </div>\n      </main>\n    </div>\n  );\n}`,
    'dashboard': { 'page.tsx': 'export default function AdminDashboard() { return <div>Admin Dashboard</div>; }' },
    'users': { 'page.tsx': 'export default function AdminUsers() { return <div>Admin Users</div>; }' },
    'teachers': { 'page.tsx': 'export default function AdminTeachers() { return <div>Admin Teachers</div>; }' },
    'lessons': { 'page.tsx': 'export default function AdminLessons() { return <div>Admin Lessons</div>; }' },
    'events': { 'page.tsx': 'export default function AdminEvents() { return <div>Admin Events</div>; }' },
    'settings': { 'page.tsx': 'export default function AdminSettings() { return <div>Admin Settings</div>; }' },
  }
};

function createStructure(basePath, obj) {
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = path.join(basePath, key);
    if (typeof value === 'string') {
      if (!fs.existsSync(currentPath)) {
        fs.writeFileSync(currentPath, value, 'utf8');
        console.log("Created file: " + currentPath);
      }
    } else {
      if (!fs.existsSync(currentPath)) {
        fs.mkdirSync(currentPath, { recursive: true });
        console.log("Created directory: " + currentPath);
      }
      createStructure(currentPath, value);
    }
  }
}

createStructure(srcApp, structure);
console.log('Scaffolding complete!');
