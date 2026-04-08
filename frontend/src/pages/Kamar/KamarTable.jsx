import { motion, AnimatePresence } from "framer-motion";
import { hoverClick } from "../../utils/animations";

// IMPORT THEME DI SINI
import { cardStyle, thStyle } from "../../utils/theme";

const KamarTable = ({ data, onEdit, onDelete, onSort, renderSortIcon }) => {
  return (
    // PAKAI THEME CARD DI SINI
    <div className={`${cardStyle} overflow-hidden flex flex-col`}>
      <div className="overflow-x-auto overflow-y-auto max-h-[60vh] custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-white/90 backdrop-blur-md shadow-sm">
            <tr className="border-b border-slate-100">
              {/* PAKAI THEME TH DI SINI */}
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
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="p-6 font-bold text-slate-800 text-lg">
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
                        className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </motion.button>
                      <motion.button
                        whileHover={hoverClick.whileHover}
                        whileTap={hoverClick.whileTap}
                        onClick={() => onDelete(k.id)}
                        className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
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