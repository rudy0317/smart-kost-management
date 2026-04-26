import { useState, useEffect } from "react";
import api from "../../../api";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, staggerContainer, hoverClick } from "../../../utils/animations";
import {
  btnPrimary, cardStyle,
  labelStyle, thStyle, inputStyle
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
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isPenyewaOpen, setIsPenyewaOpen] = useState(false);
  const [isKamarOpen, setIsKamarOpen] = useState(false);
  const [tenants, setTenants] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState({
    id_penyewa: "",
    id_kamar_baru: "",
    alasan: ""
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchFormOptions = async () => {
    try {
      const [tenantsRes, roomsRes] = await Promise.all([
        api.get("/api/pindah-kamar/active-tenants"),
        api.get("/api/pindah-kamar/available-rooms")
      ]);
      setTenants(tenantsRes.data);
      setRooms(roomsRes.data);
    } catch (error) {
      console.error("Error fetching options:", error);
      Swal.fire("Gagal", "Gagal memuat data penyewa atau kamar", "error");
    }
  };

  const handleOpenModal = () => {
    fetchFormOptions();
    setFormData({ id_penyewa: "", id_kamar_baru: "", alasan: "" });
    setIsPenyewaOpen(false);
    setIsKamarOpen(false);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id_penyewa || !formData.id_kamar_baru) {
      return Swal.fire("Peringatan", "Penyewa dan kamar tujuan harus dipilih", "warning");
    }

    try {
      await api.post("/api/pindah-kamar", formData);
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Request pindah kamar manual berhasil dibuat",
        timer: 1500,
        showConfirmButton: false
      });
      setShowModal(false);
      fetchRequests();
    } catch (error) {
      Swal.fire("Gagal", error.response?.data?.message || "Terjadi kesalahan", "error");
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await api.get("/api/pindah-kamar");
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
        await api.post(`/api/pindah-kamar/${id}/${action}`);
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

  const handleDelete = async (id) => {
    const konfirmasi = await Swal.fire({
      title: "Hapus Request?",
      text: "Data request ini akan dihapus permanen dari riwayat.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444"
    });

    if (konfirmasi.isConfirmed) {
      try {
        await api.delete(`/api/pindah-kamar/${id}`);
        Swal.fire({
          icon: "success",
          title: "Terhapus!",
          text: "Request berhasil dihapus.",
          timer: 1500,
          showConfirmButton: false
        });
        fetchRequests();
      } catch (error) {
        Swal.fire("Gagal!", "Gagal menghapus request.", "error");
      }
    }
  };

  const filteredRequests = requests.filter(req => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (req.nama || '').toLowerCase().includes(searchLower) ||
      (req.nomor_kamar_lama || '').toLowerCase().includes(searchLower) ||
      (req.nomor_kamar_baru || '').toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />
      <motion.main
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="flex-1 p-4 md:p-10 pb-20 md:pb-10"
      >
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight">Request Pindah</h1>
            <p className="text-slate-500 mt-1">Kelola permohonan pindah kamar penyewa.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <input
              type="text"
              placeholder="Cari penyewa atau kamar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${inputStyle} sm:w-64`}
            />
            <motion.button
              whileHover={hoverClick.whileHover}
              whileTap={hoverClick.whileTap}
              onClick={handleOpenModal}
              className={`${btnPrimary} px-8 py-3.5 text-[15px] whitespace-nowrap flex items-center justify-center gap-2`}
            >
              + Tambah Manual
            </motion.button>
          </div>
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
              {filteredRequests.length === 0 ? (
                <tr><td colSpan="7" className="text-center p-8 text-slate-500 font-medium">Belum ada request pindah kamar</td></tr>
              ) : filteredRequests.map((req) => (
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
                      <div className="flex gap-2">
                        {req.status === 'pending' ? (
                          <>
                            <button onClick={() => handleAction(req.id, 'setuju')} className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors" title="Setujui">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </button>
                            <button onClick={() => handleAction(req.id, 'tolak')} className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white rounded-lg transition-colors" title="Tolak">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </>
                        ) : (
                          <span className="flex items-center px-2 py-1 bg-slate-50 text-slate-400 text-[10px] font-bold uppercase rounded-md italic">Selesai</span>
                        )}
                        <button onClick={() => handleDelete(req.id)} className="p-2 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-lg transition-colors" title="Hapus Permanen">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </motion.div>
        )}
      </motion.main>

      {/* Modal Tambah Manual */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-black text-slate-800">Tambah Request Manual</h2>
              <button type="button" onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* CUSTOM DROPDOWN PENYEWA */}
              <div className="space-y-1.5 relative z-30">
                <label className={labelStyle}>Pilih Penyewa</label>
                <div
                  onClick={() => setIsPenyewaOpen(!isPenyewaOpen)}
                  className={`${inputStyle} flex items-center justify-between cursor-pointer`}
                >
                  <span className={formData.id_penyewa ? "text-slate-800 font-medium" : "text-slate-400"}>
                    {formData.id_penyewa
                      ? tenants.find(t => t.id == formData.id_penyewa)?.nama + ` (Kamar ${tenants.find(t => t.id == formData.id_penyewa)?.id_kamar})`
                      : "-- Pilih Penyewa Aktif --"}
                  </span>
                  <svg
                    className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isPenyewaOpen ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                <AnimatePresence>
                  {isPenyewaOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsPenyewaOpen(false)}></div>
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full mt-2 left-0 right-0 z-20 bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-2xl overflow-y-auto max-h-48 py-2 custom-scrollbar"
                      >
                        {tenants.map((t) => (
                          <div
                            key={t.id}
                            onClick={() => {
                              setFormData({ ...formData, id_penyewa: t.id });
                              setIsPenyewaOpen(false);
                            }}
                            className={`px-5 py-3 cursor-pointer text-sm font-bold transition-colors flex items-center justify-between ${
                              formData.id_penyewa == t.id
                                ? "bg-indigo-50/80 text-indigo-600"
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                            }`}
                          >
                            <span>{t.nama} (Kamar {t.id_kamar})</span>
                            {formData.id_penyewa == t.id && (
                              <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* CUSTOM DROPDOWN KAMAR TUJUAN */}
              <div className="space-y-1.5 relative z-20">
                <label className={labelStyle}>Kamar Tujuan</label>
                <div
                  onClick={() => setIsKamarOpen(!isKamarOpen)}
                  className={`${inputStyle} flex items-center justify-between cursor-pointer`}
                >
                  <span className={formData.id_kamar_baru ? "text-slate-800 font-medium" : "text-slate-400"}>
                    {formData.id_kamar_baru
                      ? `Kamar ${rooms.find(r => r.id == formData.id_kamar_baru)?.nomor} (${rooms.find(r => r.id == formData.id_kamar_baru)?.tipe})`
                      : "-- Pilih Kamar Kosong --"}
                  </span>
                  <svg
                    className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isKamarOpen ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                <AnimatePresence>
                  {isKamarOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsKamarOpen(false)}></div>
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full mt-2 left-0 right-0 z-20 bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-2xl overflow-y-auto max-h-48 py-2 custom-scrollbar"
                      >
                        {rooms.map((r) => (
                          <div
                            key={r.id}
                            onClick={() => {
                              setFormData({ ...formData, id_kamar_baru: r.id });
                              setIsKamarOpen(false);
                            }}
                            className={`px-5 py-3 cursor-pointer text-sm font-bold transition-colors flex items-center justify-between ${
                              formData.id_kamar_baru == r.id
                                ? "bg-indigo-50/80 text-indigo-600"
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                            }`}
                          >
                            <span>Kamar {r.nomor} ({r.tipe})</span>
                            {formData.id_kamar_baru == r.id && (
                              <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <label className={labelStyle}>Alasan Pindah (Opsional)</label>
                <textarea
                  className={inputStyle + " mt-1.5 min-h-[100px] resize-y"}
                  placeholder="Misal: AC kurang dingin..."
                  value={formData.alasan}
                  onChange={(e) => setFormData({ ...formData, alasan: e.target.value })}
                ></textarea>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-3 ${btnPrimary}`}
                >
                  Simpan Request
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default DaftarPindah;
