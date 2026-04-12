const fs = require('fs');
const path = require('path');

const files = [
  'src/pages/Admin/Dashboard.jsx',
  'src/pages/Admin/Kamar/index.jsx',
  'src/pages/Admin/Kamar/KamarTable.jsx',
  'src/pages/Admin/Pembayaran/index.jsx',
  'src/pages/Admin/Pembayaran/PembayaranTable.jsx',
  'src/pages/Admin/Pemesanan/index.jsx',
  'src/pages/Admin/Pemesanan/PemesananTable.jsx',
  'src/pages/Admin/Pengeluaran/index.jsx',
  'src/pages/Admin/Pengeluaran/PengeluaranTable.jsx',
  'src/pages/Admin/Penyewa/index.jsx',
  'src/pages/Admin/Penyewa/PenyewaTable.jsx'
];

files.forEach(f => {
  const fullPath = path.join('e:/TEKNIK INFORMATIKA/Semester 6/MPL/Kelompok 1/sistem-kost/frontend', f);
  if(fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    content = content.replace(/ dark:([a-z0-9\-\/]+)/g, '');
    content = content.replace(/ transition-colors/g, '');
    fs.writeFileSync(fullPath, content);
  }
});

const twPath = 'e:/TEKNIK INFORMATIKA/Semester 6/MPL/Kelompok 1/sistem-kost/frontend/tailwind.config.js';
if(fs.existsSync(twPath)){
  let content = fs.readFileSync(twPath, 'utf8');
  content = content.replace(/\s*darkMode:\s*['"]class['"],?/g, '');
  fs.writeFileSync(twPath, content);
}
console.log('Revert completed');
