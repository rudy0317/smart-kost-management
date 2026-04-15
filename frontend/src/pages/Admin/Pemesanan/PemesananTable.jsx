import { AnimatePresence, motion } from "framer-motion";
import { hoverClick } from "../../../utils/animations";
import Swal from "sweetalert2";
import { Check, X, CheckCircle2, Trash2 } from "lucide-react";

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
      case "menunggu_verifikasi":
        return "bg-cyan-100 text-cyan-700 ring-1 ring-cyan-200 animate-pulse";
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
      case "menunggu_verifikasi":
        return "bg-cyan-500";
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
    let metode = p.metode_bayar || 'Tunai/Cash';
    
    // Jika guest sudah pilih metode, konfirmasi saja tujuannya
    const result = await Swal.fire({
      title: 'Verifikasi Pembayaran',
      html: `
        <div class="text-left font-sans">
          <p class="text-gray-600 mb-4 text-sm">
            Konfirmasi pembayaran untuk <strong>${p.nama}</strong> - Kamar ${p.nomor_kamar}
          </p>
          <div class="bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-2xl p-4 mb-4">
            <div class="flex justify-between items-center mb-2">
              <span class="text-[10px] font-black uppercase text-indigo-400">Total Tagihan</span>
              <span class="text-lg font-black text-indigo-700 uppercase">Rp ${(Number(p.harga) + Number(p.kode_unik)).toLocaleString('id-ID')}</span>
            </div>
            <div class="flex justify-between items-center pt-2 border-t border-indigo-100">
              <span class="text-[10px] font-black uppercase text-indigo-400">Kode Unik Transfer</span>
              <span class="text-xl font-black text-indigo-900 bg-white px-3 py-1 rounded-lg border border-indigo-200">${p.kode_unik > 0 ? p.kode_unik : '-'}</span>
            </div>
          </div>
          <p class="text-[11px] text-gray-500 italic">
            * Pastikan nominal di mutasi rekening/QRIS sudah sesuai dengan digit kode unik di atas.
          </p>
          ${!p.metode_bayar ? `
            <div class="mt-4">
              <label class="text-[10px] font-black uppercase text-gray-400 mb-2 block">Pilih Metode Manual:</label>
              <select id="swal-metode" class="w-full p-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-700">
                <option value="Tunai/Cash">Tunai/Cash</option>
                <option value="Transfer">Transfer</option>
                <option value="QRIS">QRIS</option>
              </select>
            </div>
          ` : `<p class="mt-4 text-[10px] font-black uppercase text-gray-400">Metode Pilihan Penyewa: <strong class="text-indigo-600">${p.metode_bayar}</strong></p>`}
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Verifikasi & Aktivasi',
      confirmButtonColor: '#10b981',
      cancelButtonText: 'Batal',
      preConfirm: () => {
        if (!p.metode_bayar) {
          return document.getElementById('swal-metode').value;
        }
        return p.metode_bayar;
      }
    });

    if (result.isConfirmed) {
      onKonfirmasiBayar(p.id, result.value);
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
                Metode Bayar
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
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-sm font-bold text-slate-700">{p.metode_bayar || 'Tunai/Cash'}</span>
                      {p.kode_unik > 0 && (
                        <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">
                          Digit: {p.kode_unik}
                        </span>
                      )}
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
                        : p.status === "menunggu_verifikasi"
                        ? "Verifikasi Bayar"
                        : p.status
                        ? p.status.charAt(0).toUpperCase() + p.status.slice(1).replace('_', ' ')
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
                            <Check className="h-5 w-5" />
                          </motion.button>
                          <motion.button
                            whileHover={hoverClick.whileHover}
                            whileTap={hoverClick.whileTap}
                            onClick={() => handleTolak(p)}
                            className="p-3 bg-amber-50 text-amber-600 rounded-2xl hover:bg-amber-600 hover:text-white transition-all shadow-sm flex-1"
                            title="Tolak"
                          >
                             <X className="h-5 w-5" />
                          </motion.button>
                        </>
                      ) : p.status?.toLowerCase() === "menunggu_pembayaran" || p.status?.toLowerCase() === "menunggu_verifikasi" ? (
                        <motion.button
                          whileHover={hoverClick.whileHover}
                          whileTap={hoverClick.whileTap}
                          onClick={() => handleKonfirmasiBayar(p)}
                          className={`p-3 rounded-2xl transition-all shadow-sm flex-1 ${p.status === 'menunggu_verifikasi' ? 'bg-cyan-600 text-white shadow-cyan-500/20' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'}`}
                          title="Konfirmasi Pembayaran Akhir"
                        >
                          <CheckCircle2 className="h-5 w-5" />
                        </motion.button>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-400 rounded-full text-[10px] font-black uppercase border border-slate-200">
                          <CheckCircle2 size={12} />
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
                        <Trash2 className="h-5 w-5" />
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
