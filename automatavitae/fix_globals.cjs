const fs = require('fs');
const path = require('path');

const files = [
  'src/app/login/page.tsx',
  'src/app/register/page.tsx',
  'src/app/auth/callback/page.tsx',
  'src/layouts/CVLayout.tsx'
];

files.forEach(f => {
  const p = path.join(__dirname, 'frontend/web-app', f);
  let content = fs.readFileSync(p, 'utf8');
  
  // Remove inner apiUrl declarations
  content = content.replace(/const apiUrl = process\.env\.NEXT_PUBLIC_USER_SERVICE_URL \|\| 'http:\/\/localhost:3005';\n/g, '');
  content = content.replace(/const apiUrl = process\.env\.NEXT_PUBLIC_USER_SERVICE_URL \|\| 'http:\/\/localhost:3005';\s*/g, '');
  
  // Add global apiUrl if not present
  if (!content.includes('const apiUrl = process.env.NEXT_PUBLIC_API_URL')) {
    // Add right after imports
    content = content.replace(/(import .*;\n)+/, match => match + "\nconst apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';\n");
  }
  
  fs.writeFileSync(p, content, 'utf8');
  console.log('Fixed', f);
});
