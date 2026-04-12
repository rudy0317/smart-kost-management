/**
 * Theme User - Full Dark Mode & Glassmorphism
 * Theme ini khusus untuk sisi User/Penyewa dan Guest.
 * Menggunakan skema warna Slate-950 dengan aksen Cyan & Indigo.
 */

// 1. CONTAINER & CARDS
export const cardUser = "bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 rounded-[2.5rem] shadow-2xl shadow-black/20"
export const cardUserDarker = "bg-slate-950/40 backdrop-blur-xl border border-slate-800/50 rounded-[2.5rem]"

// 2. INPUTS & FORMS
export const inputUser = "w-full px-4 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-2xl outline-none focus:bg-slate-800 focus:ring-4 focus:ring-cyan-500/20 text-slate-100 placeholder-slate-500 transition-all"
export const labelUser = "text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest transition-colors"

// 3. BUTTONS
export const btnUserPrimary = "bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-cyan-950/20 transition-all disabled:opacity-50"
export const btnUserSecondary = "bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl border border-slate-700/50 transition-all"
export const btnUserGhost = "text-slate-400 hover:text-cyan-400 font-bold px-4 py-2 transition-all hover:bg-cyan-500/5 rounded-xl"

// 4. TEXT & TITLES
export const textUserHead = "text-white font-black tracking-tight"
export const textUserSub = "text-slate-400 font-medium"
export const textUserAccent = "text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 font-black"

// 5. TABLES
export const thUser = "p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800/50"
export const trUser = "hover:bg-white/5 transition-colors border-b border-slate-800/30 last:border-0"

// 6. BADGES
export const badgeUser = (colorType) => {
  const types = {
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    slate: "bg-slate-700/20 text-slate-400 border-slate-700/30"
  }
  return `px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${types[colorType] || types.slate}`
}
