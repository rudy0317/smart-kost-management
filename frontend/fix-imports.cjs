const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'pages', 'Admin');

function walk(currentDir) {
  fs.readdirSync(currentDir).forEach(f => {
    const p = path.join(currentDir, f);
    if (fs.statSync(p).isDirectory()) {
      walk(p);
    } else if (p.endsWith('.jsx')) {
      let content = fs.readFileSync(p, 'utf8');
      
      // Fix the messed up imports from previous script
      content = content.replace(/from ["']\.\.\/\.\.\/\.\.\/\/(Sidebar)["']/g, 'from "../../../components/$1"');
      content = content.replace(/from ["']\.\.\/\.\.\/\.\.\/\/(animations|theme)["']/g, 'from "../../../utils/$1"');
      
      content = content.replace(/from ["']\.\.\/\.\.\/\/(Sidebar)["']/g, 'from "../../components/$1"');
      content = content.replace(/from ["']\.\.\/\.\.\/\/(animations|theme)["']/g, 'from "../../utils/$1"');

      fs.writeFileSync(p, content);
    }
  });
}

walk(dir);
console.log("Fix imports completed.");
