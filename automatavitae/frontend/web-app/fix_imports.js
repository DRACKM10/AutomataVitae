const fs = require('fs');
const path = require('path');
const glob = require('fs/promises');

async function run() {
  const stepsDir = path.join(__dirname, 'src/components/steps');
  const files = await resolveFiles(stepsDir);
  
  files.push(path.join(__dirname, 'src/components/AIAssistant.tsx'));
  files.push(path.join(__dirname, 'src/layouts/CVLayout.tsx'));

  for (const f of files) {
    if(!fs.existsSync(f)) continue;
    let c = fs.readFileSync(f, 'utf8');
    
    // Replace relative paths with absolute alias
    c = c.replace(/['"]\.\.\/components\/([^'"]+)['"]/g, "'@/components/$1'");
    c = c.replace(/['"]\.\/ui\/([^'"]+)['"]/g, "'@/components/ui/$1'"); // if they happen to use ./ui
    c = c.replace(/['"]\.\.\/context\/([^'"]+)['"]/g, "'@/context/$1'");
    c = c.replace(/['"]\.\.\/pages\/([^'"]+)['"]/g, "'@/components/steps/$1'");

    fs.writeFileSync(f, c);
  }
  console.log('Imports fixed!');
}

async function resolveFiles(dir) {
  const dirents = await glob.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(dirents.map((dirent) => {
    const res = path.resolve(dir, dirent.name);
    return dirent.isDirectory() ? resolveFiles(res) : res;
  }));
  return Array.prototype.concat(...files);
}

run();
