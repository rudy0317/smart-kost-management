import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, useMemo } from "react"; // Tambah useMemo
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { fadeInUp } from "../utils/animations";

function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasNotified = useRef(false);

  // 1. STATE BARU BUAT SORTIR TABEL
  const [sortConfig, setSortConfig] = useState({
    key: null, // Kolom apa yang lagi disortir
    direction: "asc", // 'asc' atau 'desc'
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchDashboard();
  }, [navigate]);

  useEffect(() => {
    if (data && data.jatuh_tempo && !hasNotified.current) {
      const anakTelat = data.jatuh_tempo.filter(
        (item) => item.status === "terlambat",
      );
      if (anakTelat.length > 0) {
        toast.warning(
          `Peringatan! Ada ${anakTelat.length} anak kost yang telat bayar.`,
          {
            position: "top-right",
            autoClose: 5000,
            theme: "light",
          },
        );
        hasNotified.current = true;
      }
    }
  }, [data]);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("http://localhost:5000/api/dashboard");
      setData(res.data);
    } catch {
      setError("Gagal memuat data dashboard. Pastikan server berjalan.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const statusColor = (status) => {
    if (status === "lunas")
      return "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200";
    if (status === "terlambat")
      return "bg-red-100 text-red-700 ring-1 ring-red-200";
    return "bg-amber-100 text-amber-700 ring-1 ring-amber-200";
  };

  // 2. FUNGSI HANDLE KLIK HEADER TABEL
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // 3. FUNGSI BUAT NGELUARIN DATA YANG UDAH DISORTIR
  const sortedJatuhTempo = useMemo(() => {
    if (!data || !data.jatuh_tempo) return [];

    let sortableItems = [...data.jatuh_tempo]; // Bikin copy biar data asli gak rusak

    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        // Biar status urutannya masuk akal (lunas -> tertunda -> terlambat, atau sebaliknya)
        if (sortConfig.key === "status") {
          const order = { lunas: 1, tertunda: 2, terlambat: 3 }; // Kasih bobot
          const valA = order[a.status] || 99;
          const valB = order[b.status] || 99;
          return sortConfig.direction === "asc" ? valA - valB : valB - valA;
        }

        // Sortir biasa buat nama dan kamar
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />
      <motion.main
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="flex-1 p-10 overflow-y-auto"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">
              Dashboard
            </h1>
            <p className="text-slate-500 mt-1">
              Ringkasan operasional kost hari ini.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-2xl border border-red-100 transition-all shadow-sm"
          >
            Logout
          </motion.button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <p className="text-slate-400 font-medium animate-pulse">
              Memuat data dashboard...
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl mb-6 flex items-center justify-between">
            <span className="text-sm font-medium">{error}</span>
            <button
              onClick={fetchDashboard}
              className="ml-4 font-bold text-sm underline hover:text-red-800"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {!loading && data && (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                  Total Kamar
                </p>
                <h2 className="text-3xl font-black text-slate-800">
                  {data.total_kamar}
                </h2>
              </div>
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                  Kamar Terisi
                </p>
                <h2 className="text-3xl font-black text-emerald-600">
                  {data.terisi}
                </h2>
              </div>
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                  Kamar Kosong
                </p>
                <h2 className="text-3xl font-black text-amber-500">
                  {data.kosong}
                </h2>
              </div>
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                  Pendapatan
                </p>
                <h2 className="text-2xl font-black text-indigo-600">
                  Rp {Number(data.pendapatan || 0).toLocaleString("id-ID")}
                </h2>
              </div>
            </div>

            {/* Banner Notifikasi Telat */}
            {data.jatuh_tempo.some((item) => item.status === "terlambat") && (
              <div className="bg-red-50 border border-red-200 p-5 rounded-2xl mb-8 flex items-start gap-4">
                <div className="p-2 bg-red-100 rounded-xl">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-red-800 font-black text-sm">
                    Tagihan Menunggak!
                  </h3>
                  <p className="text-red-600 text-xs mt-1">
                    Ada anak kost yang melewati batas waktu pembayaran. Cek
                    tabel di bawah untuk detailnya.
                  </p>
                </div>
              </div>
            )}

            {/* Grid Tabel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pembayaran Belum Lunas */}
              <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-100">
                  <h3 className="text-base font-black text-slate-800">
                    Pembayaran Belum Lunas
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 sticky top-0 bg-white z-10">
                        {/* HEADER NAMA */}
                        <th
                          onClick={() => requestSort("nama_penyewa")}
                          className="group p-5 text-xs font-black uppercase tracking-widest cursor-pointer hover:bg-slate-50 transition-colors select-none"
                        >
                          <div
                            className={`flex items-center gap-1.5 transition-colors ${
                              sortConfig.key === "nama_penyewa"
                                ? "text-indigo-600" // UNGU TOTAL PAS AKTIF
                                : "text-slate-400 group-hover:text-indigo-400" // ABU BIASA, HOVER UNGU PUDAR
                            }`}
                          >
                            Nama
                            <span className="text-[10px]">
                              {sortConfig.key !== "nama_penyewa" ? (
                                <span className="opacity-30 group-hover:opacity-100 transition-opacity">
                                  ↕
                                </span>
                              ) : sortConfig.direction === "asc" ? (
                                <span className="font-bold">▲</span>
                              ) : (
                                <span className="font-bold">▼</span>
                              )}
                            </span>
                          </div>
                        </th>

                        {/* HEADER KAMAR */}
                        <th
                          onClick={() => requestSort("nomor_kamar")}
                          className="group p-5 text-xs font-black uppercase tracking-widest cursor-pointer hover:bg-slate-50 transition-colors select-none"
                        >
                          <div
                            className={`flex items-center gap-1.5 transition-colors ${
                              sortConfig.key === "nomor_kamar"
                                ? "text-indigo-600" // UNGU TOTAL PAS AKTIF
                                : "text-slate-400 group-hover:text-indigo-400" // ABU BIASA, HOVER UNGU PUDAR
                            }`}
                          >
                            Kamar
                            <span className="text-[10px]">
                              {sortConfig.key !== "nomor_kamar" ? (
                                <span className="opacity-30 group-hover:opacity-100 transition-opacity">
                                  ↕
                                </span>
                              ) : sortConfig.direction === "asc" ? (
                                <span className="font-bold">▲</span>
                              ) : (
                                <span className="font-bold">▼</span>
                              )}
                            </span>
                          </div>
                        </th>

                        {/* HEADER STATUS */}
                        <th
                          onClick={() => requestSort("status")}
                          className="group p-5 text-xs font-black uppercase tracking-widest cursor-pointer hover:bg-slate-50 transition-colors select-none"
                        >
                          <div
                            className={`flex items-center gap-1.5 transition-colors ${
                              sortConfig.key === "status"
                                ? "text-indigo-600" // UNGU TOTAL PAS AKTIF
                                : "text-slate-400 group-hover:text-indigo-400" // ABU BIASA, HOVER UNGU PUDAR
                            }`}
                          >
                            Status
                            <span className="text-[10px]">
                              {sortConfig.key !== "status" ? (
                                <span className="opacity-30 group-hover:opacity-100 transition-opacity">
                                  ↕
                                </span>
                              ) : sortConfig.direction === "asc" ? (
                                <span className="font-bold">▲</span>
                              ) : (
                                <span className="font-bold">▼</span>
                              )}
                            </span>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {sortedJatuhTempo.length === 0 ? (
                        <tr>
                          <td
                            colSpan="3"
                            className="py-10 text-center text-sm font-medium text-slate-400"
                          >
                            Semua pembayaran sudah lunas!
                          </td>
                        </tr>
                      ) : (
                        // MAPPING DARI sortedJatuhTempo BUKAN data.jatuh_tempo
                        sortedJatuhTempo.map((item) => (
                          <tr
                            key={item.id}
                            className="hover:bg-slate-50/50 transition-colors"
                          >
                            <td className="p-5 text-sm font-bold text-slate-800">
                              {item.nama_penyewa}
                            </td>
                            <td className="p-5">
                              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold border border-indigo-100">
                                Kamar {item.nomor_kamar}
                              </span>
                            </td>
                            <td className="p-5">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${statusColor(item.status)}`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full mr-2 ${item.status === "lunas" ? "bg-emerald-500" : item.status === "terlambat" ? "bg-red-500" : "bg-amber-500"}`}
                                />
                                {item.status.charAt(0).toUpperCase() +
                                  item.status.slice(1)}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Aktivitas Terbaru */}
              <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-100">
                  <h3 className="text-base font-black text-slate-800">
                    Aktivitas Terbaru
                  </h3>
                </div>
                <div className="p-6 flex flex-col gap-3">
                  {data.aktivitas.length === 0 ? (
                    <p className="py-6 text-center text-sm font-medium text-slate-400">
                      Belum ada aktivitas tercatat.
                    </p>
                  ) : (
                    data.aktivitas.map((item, index) => (
                      <div
                        key={item.id || index}
                        className="flex justify-between items-start p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all"
                      >
                        <div>
                          <p className="text-sm font-black text-slate-800">
                            {item.jenis}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {item.keterangan}
                          </p>
                        </div>
                        <p className="text-xs font-bold text-slate-400 whitespace-nowrap ml-4">
                          {new Date(item.created_at).toLocaleDateString(
                            "id-ID",
                            { day: "numeric", month: "short" },
                          )}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </motion.main>
    </div>
  );
}

export default Dashboard;
