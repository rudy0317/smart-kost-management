import { motion, AnimatePresence } from "framer-motion";
import { hoverClick } from "../../utils/animations";
import { cardStyle, thStyle } from "../../utils/theme";

const PengeluaranTable = ({ data, onEdit, onDelete, renderSortIcon, onSort }) => {
  const getKategoriColor = (kategori) => {
    const colors = {
      Listrik: "bg-yellow-100 text-yellow-800",
      Air: "bg-blue-100 text-blue-800",
      Perbaikan: "bg-red-100 text-red-800",
      Operasional: "bg-green-100 text-green-800",
      Lainnya: "bg-gray-100 text-gray-800",
    };
    return colors[kategori] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className={`${cardStyle} flex flex-col`}>
      <div className="overflow-x-auto overflow-y-auto max-h-[60vh] custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-white/90 backdrop-blur-md shadow-sm">
            <tr className="border-b border-slate-100">
              <th
                onClick={() => onSort("tanggal")}
                className={`${thStyle} cursor-pointer hover:bg-slate-50 transition-colors`}
              >
                Tanggal {renderSortIcon("tanggal")}
              </th>
              <th
                onClick={() => onSort("keterangan")}
                className={`${thStyle} cursor-pointer hover:bg-slate-50 transition-colors`}
              >
                Nama/Keterangan {renderSortIcon("keterangan")}
              </th>
              <th
                onClick={() => onSort("kategori")}
                className={`${thStyle} cursor-pointer hover:bg-slate-50 transition-colors`}
              >
                Kategori {renderSortIcon("kategori")}
              </th>
              <th
                onClick={() => onSort("jumlah")}
                className={`${thStyle} cursor-pointer hover:bg-slate-50 transition-colors text-right`}
              >
                Nominal {renderSortIcon("jumlah")}
              </th>
              <th className={`${thStyle} text-center cursor-default`}>Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            <AnimatePresence mode="popLayout">
              {data.length === 0 ? (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  layout
                >
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    Tidak ada data pengeluaran
                  </td>
                </motion.tr>
              ) : (
                data.map((item) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    layout
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {new Date(item.tanggal).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {item.keterangan}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getKategoriColor(
                          item.kategori
                        )}`}
                      >
                        {item.kategori}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 text-right font-medium">
                      Rp {item.jumlah.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {/* INI BAGIAN YANG BENERNYA BRO (ADA 2 TOMBOL) */}
                      <div className="flex justify-center gap-2">
                        {/* Tombol Edit */}
                        <motion.button
                          variants={hoverClick}
                          whileHover="hover"
                          whileTap="tap"
                          onClick={() => onEdit(item)}
                          title="Edit Pengeluaran"
                          className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </motion.button>

                        {/* Tombol Hapus */}
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

export default PengeluaranTable;