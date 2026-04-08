import { motion, AnimatePresence } from "framer-motion";
import { hoverClick } from "../../utils/animations";
import { cardStyle, thStyle } from "../../utils/theme";

const PenyewaTable = ({ data, onEdit, onDelete, renderSortIcon, onSort }) => {
  return (
    <div className={`${cardStyle} overflow-hidden flex flex-col`}>
      <div className="overflow-x-auto overflow-y-auto max-h-[60vh] custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-white/90 backdrop-blur-md shadow-sm">
            <tr className="border-b border-slate-100">
              <th
                onClick={() => onSort("nama")}
                className={`${thStyle} cursor-pointer hover:bg-slate-50 transition-colors`}
              >
                Penyewa {renderSortIcon("nama")}
              </th>
              <th
                onClick={() => onSort("nomor_kamar")}
                className={`${thStyle} cursor-pointer hover:bg-slate-50 transition-colors`}
              >
                Kamar {renderSortIcon("nomor_kamar")}
              </th>
              <th
                onClick={() => onSort("tanggal_masuk")}
                className={`${thStyle} cursor-pointer hover:bg-slate-50 transition-colors text-center`}
              >
                Tgl Masuk {renderSortIcon("tanggal_masuk")}
              </th>
              <th
                onClick={() => onSort("status")}
                className={`${thStyle} cursor-pointer hover:bg-slate-50 transition-colors`}
              >
                Status {renderSortIcon("status")}
              </th>
              <th className={`${thStyle} text-center cursor-default`}>
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            <AnimatePresence mode="popLayout">
              {data.length === 0 ? (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td
                    colSpan="5"
                    className="p-12 text-center text-sm font-bold text-slate-500 bg-slate-50/50 rounded-xl"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <svg className="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .375c0-.621-.504-1.125-1.125-1.125H20.25M18 12c0 .621-.504 1.125-1.125 1.125H9.75M9 5.25c0-.621.504-1.125 1.125-1.125h3.75a1.125 1.125 0 011.125 1.125v10.5a1.125 1.125 0 01-1.125 1.125H9.75a1.125 1.125 0 01-1.125-1.125V5.25z" />
                      </svg>
                      Belum ada data penyewa.
                    </div>
                  </td>
                </motion.tr>
              ) : (
                data.map((item) => (
                  <motion.tr
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="p-6">
                      <div className="font-bold text-slate-800 text-lg">{item.nama}</div>
                      <div className="text-sm text-slate-500 font-medium">{item.no_hp}</div>
                    </td>
                    <td className="p-6">
                      <span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase border bg-indigo-50 text-indigo-600 border-indigo-100">
                        Kamar {item.nomor_kamar}
                      </span>
                    </td>
                    <td className="p-6 font-semibold text-slate-700 text-center">
                      {item.tanggal_masuk
                        ? new Date(item.tanggal_masuk).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
                    </td>
                    <td className="p-6">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold leading-4 transition-all ${
                          item.status === "aktif"
                            ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
                            : "bg-rose-100 text-rose-700 ring-1 ring-rose-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full mr-2 ${
                            item.status === "aktif" ? "bg-emerald-500" : "bg-rose-500"
                          }`}
                        ></span>
                        {item.status === "aktif" ? "Aktif" : "Keluar"}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex justify-center gap-3">
                        <motion.button
                          whileHover={hoverClick.whileHover}
                          whileTap={hoverClick.whileTap}
                          onClick={() => onEdit(item)}
                          className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </motion.button>
                        <motion.button
                          whileHover={hoverClick.whileHover}
                          whileTap={hoverClick.whileTap}
                          onClick={() => onDelete(item.id)}
                          className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PenyewaTable;