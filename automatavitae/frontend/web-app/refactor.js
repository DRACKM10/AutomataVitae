const fs = require('fs');
const path = require('path');
const files = [
  'src/context/store.tsx',
  'src/layouts/CVLayout.tsx',
  'src/components/AIAssistant.tsx',
  'src/components/steps/StepPersonalInfo.tsx',
  'src/components/steps/StepExperience.tsx',
  'src/components/steps/StepEducation.tsx',
  'src/components/steps/StepSkills.tsx',
  'src/components/steps/StepPreview.tsx',
  'src/components/steps/ResumePreview.tsx'
];

files.forEach(f => {
  const p = path.join('d:/AutomataVitae/automatavitae/frontend/web-app', f);
  if(!fs.existsSync(p)) return;
  let c = fs.readFileSync(p, 'utf8');
  if(!c.startsWith('"use client";')) {
    c = '"use client";\n' + c;
  }
  
  c = c.replace(/import {([^}]+)} from ['"](?:react-router-dom|react-router)['"];/g, (match, imports) => {
     let res = [];
     if(imports.includes('Link')) res.push("import Link from 'next/link';");
     
     let d=[]
     if(imports.includes('useNavigate')) d.push('useRouter');
     if(imports.includes('useLocation')) d.push('usePathname');
     if(d.length > 0) res.push(`import { ${d.join(', ')} } from 'next/navigation';`);
     return res.join('\n');
  });
  
  c = c.replace(/const navigate = useNavigate\(\);/g, "const router = useRouter();");
  c = c.replace(/navigate\(/g, "router.push(");
  c = c.replace(/const location = useLocation\(\);/g, "const pathname = usePathname();");
  c = c.replace(/location\.pathname/g, "pathname");
  
  // Update internal pathing
  c = c.replace(/['"]\/app\//g, "'/create/");
  c = c.replace(/['"]\/app['"]/g, "'/create'");
  c = c.replace(/['"]\/app\/([^'"]+)['"]/g, "'/create/$1'");
  
  // Layout specific
  c = c.replace(/<Outlet \/>/g, "{children}");
  c = c.replace(/import { Outlet } from.*?;/g, "");
  
  fs.writeFileSync(p, c);
});
console.log('Refactoring finished!');
