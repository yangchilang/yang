import fs from 'fs';
import path from 'path';

const srcDir = path.join(process.cwd(), 'functions');
const destDir = path.join(process.cwd(), 'dist', 'functions');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

function copyDir(src, dest) {
  const files = fs.readdirSync(src);
  for (const file of files) {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath);
      }
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyDir(srcDir, destDir);
console.log('Functions copied successfully');
