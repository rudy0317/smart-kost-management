import { AnimatePresence, motion } from "framer-motion";
import { hoverClick } from "../../../utils/animations";
import Swal from "sweetalert2";

const PemesananTable = ({
  data,
  onUpdateStatus,
  onKonfirmasiBayar,
  onDelete,
  renderSortIcon,
  onSort,
}) => {
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-amber-100 text-amber-700 ring-1 ring-amber-200";
      case "menunggu_pembayaran":
        return "bg-blue-100 text-blue-700 ring-1 ring-blue-200";
      case "disetujui":
        return "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200";
      case "ditolak":
        return "bg-red-100 text-red-700 ring-1 ring-red-200";
      default:
        return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
    }
  };

  const getDotColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-amber-500";
      case "menunggu_pembayaran":
        return "bg-blue-500";
      case "disetujui":
        return "bg-emerald-500";
      case "ditolak":
        return "bg-red-500";
      default:
        return "bg-slate-500";
    }
  };

  const handleSetuju = async (p) => {
    const result = await Swal.fire({
      title: "Setujui Tanpa Bayar?",
      text: `${p.nama} akan diminta melakukan pembayaran terlebih dahulu.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Lanjutkan!",
      cancelButtonText: "Batal",
    });
    if (result.isConfirmed) onUpdateStatus(p.id, "menunggu_pembayaran");
  };

  const handleKonfirmasiBayar = async (p) => {
    const { value: metode } = await Swal.fire({
      title: 'Konfirmasi Pembayaran',
      text: `Pilih metode pembayaran ${p.nama} untuk Kamar ${p.nomor_kamar}`,
      input: 'radio',
      inputOptions: {
        'Tunai/Cash': 'Tunai/Cash',
        'Transfer': 'Transfer',
        'QRIS': 'QRIS'
      },
      inputValidator: (value) => {
        if (!value) {
          return 'Pilih salah satu metode pembayaran!'
        }
      },
      showCancelButton: true,
      confirmButtonText: 'Konfirmasi Bayar',
      confirmButtonColor: '#10b981',
      cancelButtonText: 'Batal',
    });

    if (metode) {
      onKonfirmasiBayar(p.id, metode);
    }
  };

  const handleTolak = async (p) => {
    const result = await Swal.fire({
      title: "Tolak Pemesanan?",
      text: `Pemesanan dari ${p.nama} akan ditolak!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f59e0b",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Tolak!",
      cancelButtonText: "Batal",
    });
    if (result.isConfirmed) onUpdateStatus(p.id, "ditolak");
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col">
      <div className="overflow-x-auto overflow-y-auto max-h-[60vh] custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-white/90 backdrop-blur-md shadow-sm">
            <tr className="border-b border-slate-100">
              <th
                onClick={() => onSort?.("nama")}
                className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-indigo-600"
              >
                Pemesan {renderSortIcon?.("nama")}
              </th>
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">
                Kamar
              </th>
              <th
                onClick={() => onSort?.("tanggal_masuk")}
                className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest text-center cursor-pointer hover:text-indigo-600"
              >
                Tanggal Masuk {renderSortIcon?.("tanggal_masuk")}
              </th>
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest text-center">
                Status
              </th>
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest text-center">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            <AnimatePresence mode="popLayout">
              {data.map((p) => (
                <motion.tr
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="hover:bg-slate-50/50:bg-slate-700/50 group"
                >
                  <td className="p-6">
                    <p className="font-bold text-slate-800 text-lg leading-tight">{p.nama || p.nama_penyewa}</p>
                    {p.no_hp && (
                      <p className="text-xs text-slate-400 font-medium mt-0.5">{p.no_hp}</p>
                    )}
                  </td>
                  <td className="p-6 whitespace-nowrap">
                    <div className="flex flex-col items-start gap-1">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold border border-indigo-100">
                        Kamar {p.nomor_kamar}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">{p.tipe}</span>
                        <span className="text-xs font-semibold text-slate-700">
                          Rp {Number(p.harga || 0).toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <div className="text-sm font-bold text-slate-700">
                      {p.tanggal_masuk
                        ? new Date(p.tanggal_masuk).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            },
                          )
                        : "-"}
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase transition-all ${getStatusBadge(p.status)}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full mr-2 ${getDotColor(p.status)}`}
                      ></span>
                      {p.status === "menunggu_pembayaran"
                        ? "Menunggu Bayar"
                        : p.status
                        ? p.status.charAt(0).toUpperCase() + p.status.slice(1)
                        : "Pending"}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex justify-center gap-2">
                      {p.status?.toLowerCase() === "pending" ? (
                        <>
                          <motion.button
                            whileHover={hoverClick.whileHover}
                            whileTap={hoverClick.whileTap}
                            onClick={() => handleSetuju(p)}
                            className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm flex-1"
                            title="Approval Tahap 1"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </motion.button>
                          <motion.button
                            whileHover={hoverClick.whileHover}
                            whileTap={hoverClick.whileTap}
                            onClick={() => handleTolak(p)}
                            className="p-3 bg-amber-50 text-amber-600 rounded-2xl hover:bg-amber-600 hover:text-white transition-all shadow-sm flex-1"
                            title="Tolak"
                          >
                             <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                             </svg>
                          </motion.button>
                        </>
                      ) : p.status?.toLowerCase() === "menunggu_pembayaran" ? (
                        <motion.button
                          whileHover={hoverClick.whileHover}
                          whileTap={hoverClick.whileTap}
                          onClick={() => handleKonfirmasiBayar(p)}
                          className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm flex-1"
                          title="Konfirmasi Pembayaran Akhir"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </motion.button>
                      ) : (
                        <span className="px-3 py-1 bg-slate-50 text-slate-400 rounded-full text-[10px] font-black uppercase border border-slate-200">
                          Selesai
                        </span>
                      )}
                      <motion.button
                        whileHover={hoverClick.whileHover}
                        whileTap={hoverClick.whileTap}
                        onClick={() => onDelete(p.id)}
                        className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600:bg-red-500 hover:text-white:text-white transition-all shadow-sm"
                        title="Hapus"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
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

export default PemesananTable;
