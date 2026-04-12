import { motion, AnimatePresence } from "framer-motion";
import { hoverClick } from "../../../utils/animations";
import { cardStyle, thStyle } from "../../../utils/theme";

const PembayaranTable = ({
  data,
  onEdit,
  onDelete,
  renderSortIcon,
  onSort,
  formatBulanDisplay,
  statusColor,
}) => {
  return (
    <div className={`${cardStyle} overflow-hidden flex flex-col`}>
      <div className="overflow-x-auto overflow-y-auto max-h-[60vh] custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-white/90 backdrop-blur-md shadow-sm">
            <tr className="border-b border-slate-100">
              <th
                onClick={() => onSort("nama_penyewa")}
                className={`${thStyle} cursor-pointer hover:bg-slate-50`}
              >
                Penyewa {renderSortIcon("nama_penyewa")}
              </th>
              <th
                onClick={() => onSort("jumlah")}
                className={`${thStyle} cursor-pointer hover:bg-slate-50`}
              >
                Detail Transaksi {renderSortIcon("jumlah")}
              </th>
              <th
                onClick={() => onSort("bulan")}
                className={`${thStyle} cursor-pointer hover:bg-slate-50 text-center`}
              >
                Bulan Tagihan {renderSortIcon("bulan")}
              </th>
              <th
                onClick={() => onSort("tanggal_bayar")}
                className={`${thStyle} cursor-pointer hover:bg-slate-50 text-center`}
              >
                Tgl Bayar {renderSortIcon("tanggal_bayar")}
              </th>
              <th
                onClick={() => onSort("status")}
                className={`${thStyle} cursor-pointer hover:bg-slate-50`}
              >
                Status {renderSortIcon("status")}
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
                >
                  <td
                    colSpan="6"
                    className="p-12 text-center text-sm font-bold text-slate-500 bg-slate-50/50 rounded-xl"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <svg
                        className="w-16 h-16 text-slate-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Belum ada data pembayaran.
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
                    className="hover:bg-slate-50/50:bg-slate-700/50 group"
                  >
                    <td className="p-6">
                      <div className="font-bold text-slate-800 text-lg">
                        {item.nama_penyewa}
                      </div>
                      <div className="text-sm text-slate-500 font-medium">
                        Kamar {item.nomor_kamar}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="font-bold text-slate-800 text-lg">
                        Rp {Number(item.jumlah).toLocaleString("id-ID")}
                      </div>
                      <div className="text-sm text-slate-500 italic flex items-center gap-2">
                        {item.kategori}
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-100">
                          {item.metode_bayar}
                        </span>
                      </div>
                    </td>
                    <td className="p-6 font-semibold text-slate-700 text-center">
                      {formatBulanDisplay(item.bulan)}
                    </td>
                    <td className="p-6 font-semibold text-slate-700 text-center">
                      {item.tanggal_bayar
                        ? new Date(item.tanggal_bayar).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )
                        : "-"}
                    </td>
                    <td className="p-6">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold leading-4 transition-all ${statusColor(item.status)}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full mr-2 ${
                            item.status === "lunas"
                              ? "bg-emerald-500"
                              : item.status === "terlambat"
                                ? "bg-red-500"
                                : "bg-amber-500"
                          }`}
                        ></span>
                        {item.status.charAt(0).toUpperCase() +
                          item.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex justify-center gap-3">
                        <motion.button
                          whileHover={hoverClick.whileHover}
                          whileTap={hoverClick.whileTap}
                          onClick={() => onEdit(item)}
                          className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600:bg-indigo-500 hover:text-white:text-white transition-all shadow-sm"
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
                        <motion.button
                          whileHover={hoverClick.whileHover}
                          whileTap={hoverClick.whileTap}
                          onClick={() => onDelete(item.id)}
                          className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600:bg-red-500 hover:text-white:text-white transition-all shadow-sm"
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
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

export default PembayaranTable;
