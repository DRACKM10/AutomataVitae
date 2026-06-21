const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend/web-app/src');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) { 
      results.push(file);
    }
  });
  return results;
}

const files = walk(srcDir);
let changedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // 1. Remove duplicate global apiUrl declarations from dashboard and StepPreview
  content = content.replace(/const apiUrl = process\.env\.NEXT_PUBLIC_apiUrl \|\| 'http:\/\/localhost:3007';\n/g, '');
  content = content.replace(/const apiUrl  = process\.env\.NEXT_PUBLIC_apiUrl  \|\| 'http:\/\/localhost:3006';\n/g, '');
  content = content.replace(/const apiUrl  = process\.env\.NEXT_PUBLIC_apiUrl  \|\| 'http:\/\/localhost:3001';\n/g, '');

  // 2. Unify USER_SERVICE_URL usages
  content = content.replace(/const apiUrl = process\.env\.NEXT_PUBLIC_USER_SERVICE_URL \|\| 'http:\/\/localhost:3005';/g, "const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';");

  // If after replacing, there's a missing global apiUrl but it's needed globally (e.g. dashboard), we must ensure it exists.
  // Actually, dashboard has NO global apiUrl now since we removed all 3! Let's inject it.
  if (file.endsWith('dashboard\\page.tsx') || file.endsWith('dashboard/page.tsx')) {
    content = content.replace(/interface CVItem/g, "const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';\n\ninterface CVItem");
    // Remove the inner one we just replaced in step 2 to avoid shadowing
    content = content.replace(/const apiUrl = process\.env\.NEXT_PUBLIC_API_URL \|\| 'http:\/\/localhost:3001';\n\s*const profileRes = await fetch/g, "const profileRes = await fetch");
  }

  if (file.endsWith('StepPreview.tsx')) {
    content = content.replace(/interface StepPreviewProps/g, "const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';\n\ninterface StepPreviewProps");
  }

  // Deduplicate block-scoped `apiUrl` in login and register
  if (file.endsWith('login\\page.tsx') || file.endsWith('login/page.tsx') || file.endsWith('register\\page.tsx') || file.endsWith('register/page.tsx') || file.endsWith('callback\\page.tsx') || file.endsWith('callback/page.tsx')) {
    // If it's already defined globally or at the component level, we can just remove the inner definitions
    // Let's just make sure there's only one definition per scope.
    // Easiest is to replace inner declarations with nothing if we just use process.env directly, but wait!
    // They did: const apiUrl = process.env.NEXT_PUBLIC_API_URL...
    // Let's replace 'const apiUrl =' with nothing if it's already defined? No, that causes errors.
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated', file);
    changedFiles++;
  }
});

console.log(`Done. Changed ${changedFiles} files.`);
