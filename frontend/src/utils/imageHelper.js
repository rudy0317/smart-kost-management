import kamarDefaultImg from '../assets/kamar_default.png'
import kamarStandarImg from '../assets/kamar_standar.png'
import kamarPremiumImg from '../assets/kamar_premium.png'
import kamarVipImg from '../assets/kamar_vip.png'

export const tipeImages = {
  standar: kamarStandarImg,
  standard: kamarStandarImg,
  premium: kamarPremiumImg,
  deluxe: kamarPremiumImg,
  vip: kamarVipImg,
  ac: kamarPremiumImg,
  'non ac': kamarStandarImg,
};

export function getKamarImage(k) {
  if (k.foto_kamar) return k.foto_kamar;
  const tipe = (k.tipe || '').toLowerCase();
  
  // Urutkan key agar yang lebih panjang (spesifik) dicek dulu
  const keys = Object.keys(tipeImages).sort((a, b) => b.length - a.length);
  
  for (const key of keys) {
    if (tipe.includes(key)) return tipeImages[key];
  }
  return kamarDefaultImg;
}
