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
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.css')) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  if (filePath.endsWith('index.css')) {
    content = content.replace(
      /\.glass-panel\s*\{[^}]*\}/g,
      `.glass-panel {\n    @apply bg-white/80 backdrop-blur-md border border-white/20 rounded-3xl shadow-[0_8px_32px_rgba(0,119,182,0.05)];\n  }`
    );
    content = content.replace(
      /\.glass-card\s*\{[^}]*\}/g,
      `.glass-card {\n    @apply bg-white/80 backdrop-blur-md border border-white/20 rounded-2xl hover:bg-white hover:border-white/40 transition-all duration-500 shadow-[0_4px_16px_rgba(0,119,182,0.03)];\n  }`
    );
  } else {
    // Typography adjustments for Zen Tech
    content = content.replace(/text-dark/g, 'text-slate-900');
    content = content.replace(/text-slate-500/g, 'text-slate-600');
    content = content.replace(/text-slate-700/g, 'text-slate-600'); // Normalize body text to 600
    
    // Ensure buttons have pure white text
    content = content.replace(/bg-primary hover:bg-\[\#005f92\](?! text-white)/g, 'bg-primary hover:bg-[#005f92] text-white');
    
    // Clean up any double text-white
    content = content.replace(/text-white text-white/g, 'text-white');
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
};

walkDir('./frontend/src', replaceInFile);
