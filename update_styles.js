const fs = require('fs');
const path = require('path');

const walkDir = (dir, callback) => {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
};

const replaceInFile = (filePath) => {
  if (!filePath.endsWith('.tsx')) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Colors
  content = content.replace(/text-slate-300/g, 'text-slate-700');
  content = content.replace(/text-slate-400/g, 'text-slate-500');
  content = content.replace(/text-white/g, 'text-dark');
  content = content.replace(/text-indigo-400/g, 'text-primary');
  content = content.replace(/text-indigo-300/g, 'text-primary');
  
  // Backgrounds
  content = content.replace(/bg-indigo-500\/10/g, 'bg-primary/5');
  content = content.replace(/bg-indigo-500\/20/g, 'bg-primary/10');
  content = content.replace(/bg-indigo-500/g, 'bg-primary');
  content = content.replace(/hover:bg-indigo-600/g, 'hover:bg-[#005f92]');
  
  content = content.replace(/bg-slate-900\/50/g, 'bg-white/60');
  content = content.replace(/bg-slate-900\/80/g, 'bg-white/80');
  content = content.replace(/bg-slate-900/g, 'bg-slate-50');
  content = content.replace(/bg-\[\#020617\]/g, 'bg-slate-50');
  
  content = content.replace(/bg-obsidian-950\/40/g, 'bg-white/40');
  content = content.replace(/bg-obsidian-950\/20/g, 'bg-white/20');
  content = content.replace(/bg-obsidian-950\/80/g, 'bg-white/80');
  
  content = content.replace(/bg-white\/5/g, 'bg-white/60');
  content = content.replace(/bg-white\/10/g, 'bg-white/80');
  
  // Borders
  content = content.replace(/border-white\/10/g, 'border-slate-200');
  content = content.replace(/border-white\/5/g, 'border-slate-100');
  content = content.replace(/border-indigo-500\/20/g, 'border-primary/10');
  content = content.replace(/border-indigo-500\/30/g, 'border-primary/20');
  
  // Shadows
  content = content.replace(/shadow-\[0_0_20px_rgba\(99,102,241,0\.3\)\]/g, 'shadow-[0_4px_16px_rgba(0,119,182,0.15)]');
  content = content.replace(/shadow-\[0_0_30px_rgba\(99,102,241,0\.3\)\]/g, 'shadow-[0_4px_24px_rgba(0,119,182,0.15)]');
  content = content.replace(/shadow-\[0_0_15px_rgba\(99,102,241,0\.2\)\]/g, 'shadow-[0_4px_12px_rgba(0,119,182,0.15)]');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
};

walkDir('./frontend/src/components', replaceInFile);
