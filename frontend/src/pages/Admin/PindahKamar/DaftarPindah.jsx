import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../../utils/animations";
import { 
  btnPrimary, cardStyle, 
  labelStyle, thStyle 
} from "../../../utils/theme";

const titleStyle = "text-xl font-black text-slate-800 tracking-tight";
const badgeStyle = (type) => {
  if (type === 'success') return "px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold uppercase tracking-wider";
  if (type === 'danger') return "px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-bold uppercase tracking-wider";
  return "px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-xs font-bold uppercase tracking-wider";
};
import Sidebar from "../../../components/Sidebar";

const DaftarPindah = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/pindah-kamar");
      setRequests(response.data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    const isSetuju = action === 'setuju';
    const konfirmasi = await Swal.fire({
      title: isSetuju ? "Setujui Pindah Kamar?" : "Tolak Pindah Kamar?",
      text: isSetuju 
        ? "Kamar pengguna akan diubah ke kamar baru dan tagihan berbeda akan berlaku di bulan berikutnya." 
        : "Permintaan pindah kamar akan dibatalkan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: isSetuju ? "Ya, Setujui" : "Ya, Tolak",
      cancelButtonText: "Batal",
      confirmButtonColor: isSetuju ? "#10b981" : "#ef4444"
    });

    if (konfirmasi.isConfirmed) {
      try {
        await axios.post(`http://localhost:5000/api/pindah-kamar/${id}/${action}`);
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
        Toast.fire({ icon: "success", title: `Permintaan berhasil ${isSetuju ? 'disetujui' : 'ditolak'}` });
        fetchRequests();
      } catch (error) {
        Swal.fire("Gagal!", error.response?.data?.message || "Terjadi kesalahan", "error");
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />
      <motion.main
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="flex-1 p-10"
      >
        <div className="mb-10">
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Request Pindah</h1>
          <p className="text-slate-500 mt-1">Kelola permohonan pindah kamar penyewa.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
             <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <motion.div variants={fadeInUp} className={cardStyle}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className={thStyle}>Tanggal</th>
                <th className={thStyle}>Penyewa</th>
                <th className={thStyle}>Kamar Lama</th>
                <th className={thStyle}>Kamar Baru</th>
                <th className={thStyle}>Alasan</th>
                <th className={thStyle}>Status</th>
                <th className={thStyle}>Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.length === 0 ? (
                <tr><td colSpan="7" className="text-center p-8 text-slate-500 font-medium">Belum ada request pindah kamar</td></tr>
              ) : requests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 px-6 text-sm text-slate-600">
                    {new Date(req.created_at).toLocaleDateString('id-ID')}
                  </td>
                  <td className="p-4 px-6">
                    <p className="font-bold text-slate-800">{req.nama}</p>
                    <p className="text-[11px] font-medium text-slate-400">{req.no_hp}</p>
                  </td>
                  <td className="p-4 px-6">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold shadow-sm">
                      Kamar {req.nomor_kamar_lama}
                    </span>
                  </td>
                  <td className="p-4 px-6">
                    <span className="px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg text-xs font-bold shadow-sm">
                      Kamar {req.nomor_kamar_baru}
                    </span>
                  </td>
                  <td className="p-4 px-6 max-w-[200px]">
                    <p className="text-xs text-slate-600 truncate" title={req.alasan}>{req.alasan || '-'}</p>
                  </td>
                  <td className="p-4 px-6">
                    <span className={badgeStyle(req.status === 'disetujui' ? 'success' : req.status === 'ditolak' ? 'danger' : 'warning')}>
                      {req.status}
                    </span>
                  </td>
                  <td className="p-4 px-6">
                    {req.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button onClick={() => handleAction(req.id, 'setuju')} className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors" title="Setujui">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </button>
                        <button onClick={() => handleAction(req.id, 'tolak')} className="p-2 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-lg transition-colors" title="Tolak">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium italic">Selesai</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </motion.div>
        )}
      </motion.main>
    </div>
  );
};

export default DaftarPindah;
