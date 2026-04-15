import { motion, AnimatePresence } from "framer-motion";
import { hoverClick } from "../../../utils/animations";

// IMPORT THEME DI SINI
import { cardStyle, thStyle } from "../../../utils/theme";
import { getKamarImage } from "../../../utils/imageHelper";
import kamarDefaultImg from "../../../assets/kamar_default.png";

const KamarTable = ({ data, onEdit, onDelete, onSort, renderSortIcon }) => {
  return (
    // PAKAI THEME CARD DI SINI
    <div className={`${cardStyle} overflow-hidden flex flex-col`}>
      <div className="overflow-x-auto overflow-y-auto max-h-[60vh] custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur-md">
            <tr className="border-b border-slate-100">
              {/* PAKAI THEME TH DI SINI */}
              <th className={thStyle}>Preview</th>
              <th onClick={() => onSort("nomor")} className={thStyle}>
                Nomor {renderSortIcon("nomor")}
              </th>
              <th onClick={() => onSort("tipe")} className={thStyle}>
                Tipe {renderSortIcon("tipe")}
              </th>
              <th onClick={() => onSort("harga")} className={thStyle}>
                Harga {renderSortIcon("harga")}
              </th>
              <th onClick={() => onSort("status")} className={thStyle}>
                Status {renderSortIcon("status")}
              </th>
              {/* KHUSUS "AKSI", kita timpa cursor dan hover-nya karena gak bisa diklik buat sort */}
              <th className={`${thStyle} text-center cursor-default hover:text-slate-400`}>
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            <AnimatePresence mode="popLayout">
              {data.map((k) => (
                <motion.tr
                  key={k.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="hover:bg-slate-50/50:bg-slate-700/50 group"
                >
                  <td className="p-6">
                    <div className="w-16 h-12 rounded-lg overflow-hidden border border-slate-100 shadow-sm bg-slate-50">
                      <img 
                        src={getKamarImage(k)} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = kamarDefaultImg }}
                      />
                    </div>
                  </td>
                  <td className="p-6 font-bold text-slate-800 text-base">
                    {k.nomor}
                  </td>
                  <td className="p-6">
                    <span
                      className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase border ${
                        k.tipe === "VIP"
                          ? "bg-amber-50 text-amber-600 border-amber-100"
                          : k.tipe === "Premium"
                            ? "bg-purple-50 text-purple-600 border-purple-100"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {k.tipe}
                    </span>
                  </td>
                  <td className="p-6 font-semibold text-slate-700">
                    Rp {Number(k.harga).toLocaleString("id-ID")}
                  </td>
                  <td className="p-6 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold leading-4 transition-all ${
                        k.status === "kosong" || k.status === "tersedia"
                          ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
                          : "bg-rose-100 text-rose-700 ring-1 ring-rose-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full mr-2 ${
                          k.status === "kosong" || k.status === "tersedia"
                            ? "bg-emerald-500"
                            : "bg-rose-500"
                        }`}
                      ></span>
                      {k.status === "kosong" || k.status === "tersedia" ? "Kosong" : "Terisi"}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex justify-center gap-3">
                      <motion.button
                        whileHover={hoverClick.whileHover}
                        whileTap={hoverClick.whileTap}
                        onClick={() => onEdit(k)}
                        className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm group/btn"
                      >
                        <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                        </svg>
                      </motion.button>
                      <motion.button
                        whileHover={hoverClick.whileHover}
                        whileTap={hoverClick.whileTap}
                        onClick={() => onDelete(k.id)}
                        className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm group/btn"
                      >
                        <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KamarTable;