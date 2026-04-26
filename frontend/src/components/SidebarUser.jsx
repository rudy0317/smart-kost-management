import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import { btnUserPrimary, textUserAccent } from "../utils/themeUser";
import api from "../api";

function SidebarUser({ activeTab, setActiveTab, status }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [userData, setUserData] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("user_token");
    if (!token) return;

    // Fallback: decode from token immediately
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserData({
        nama: payload.nama || "Penyewa",
        no_hp: payload.no_hp || "-",
        role: "Penyewa"
      });
    } catch {}

    // Real update: fetch latest from dashboard info (contains specific tenant name)
    api.get("/api/user-dashboard/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        const data = res.data;
        if (data.status === 'active' && data.penyewa) {
          setUserData({
            nama: data.penyewa.nama,
            no_hp: data.penyewa.no_hp || "-",
            role: "Penyewa"
          });
        } else if (data.latest_booking) {
          setUserData({
            nama: data.latest_booking.nama,
            no_hp: data.latest_booking.no_hp || "-",
            role: "Penyewa"
          });
        }
      })
      .catch((err) => console.error("Gagal ambil data user:", err));
  }, []);

  const displayName = userData?.nama || "Penyewa";
  const displayRole = "Penyewa";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  const menuItems = [
    {
      id: "overview",
      label: "Dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: "pengeluaran",
      label: "Buku Kas Pribadi",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: "history",
      label: "Riwayat Sewa",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
    {
      id: "katalog",
      label: "Katalog Kamar",
      path: "/katalog",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
  ];

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Yakin mau keluar?",
      text: "Sesi penyewa Anda akan diakhiri.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Keluar",
      cancelButtonText: "Batal",
      // Dark theme
      background: "#0f172a",
      color: "#f1f5f9",
      iconColor: "#f59e0b",
      customClass: {
        popup: "border border-slate-700 rounded-2xl shadow-2xl",
        title: "text-slate-100 font-bold",
        htmlContainer: "text-slate-400",
        confirmButton: "bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl px-6 py-2.5 text-sm",
        cancelButton: "bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-xl px-6 py-2.5 text-sm",
      },
      buttonsStyling: false,
    });
    if (result.isConfirmed) {
      localStorage.removeItem("user_token");
      navigate("/");
    }
  };

  const handleMenuClick = (item) => {
    if (item.path) {
      navigate(item.path);
    } else {
      setActiveTab(item.id);
      if (location.pathname !== "/dashboard-user") {
        navigate("/dashboard-user");
      }
    }
  };

  return (
    <>
      <AnimatePresence>
        {showProfile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProfile(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed bottom-24 left-4 w-72 z-50"
            >
              <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
                <div className="h-16 bg-gradient-to-r from-cyan-600 to-indigo-600" />
                <div className="px-5 pb-5">
                  <div className="flex items-end gap-3 -mt-7 mb-4">
                    <div className="w-14 h-14 rounded-full bg-cyan-600 border-4 border-slate-800 flex items-center justify-center text-white text-xl font-black shadow-lg">
                      {avatarLetter}
                    </div>
                    <span className="mb-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-500/30">
                      Member Kost
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-slate-700/50 rounded-xl px-3.5 py-2.5">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Nama</p>
                      <p className="text-sm font-bold">{displayName}</p>
                    </div>
                    <div className="bg-slate-700/50 rounded-xl px-3.5 py-2.5">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Tipe Akun</p>
                      <p className="text-sm font-bold text-cyan-400">Penyewa Aktif</p>
                    </div>
                  </div>
                  <button onClick={handleLogout} className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-sm transition-all border border-red-500/20">
                    Keluar
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <motion.div
        animate={{ width: isOpen ? 256 : 80 }}
        transition={{ duration: 0.4, ease: "circOut" }}
        className="sticky top-0 h-screen bg-slate-900 flex flex-col z-40 shadow-xl overflow-hidden border-r border-slate-800 shrink-0"
      >
        <div className={`p-6 flex items-center mb-4 transition-all ${isOpen ? "justify-between" : "justify-center"}`}>
          {isOpen && (
            <motion.h3
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
              className={`text-2xl whitespace-nowrap ${textUserAccent}`}
            >
              KOST ASYNC
            </motion.h3>
          )}
          <button onClick={() => setIsOpen(!isOpen)} className="w-8 h-8 flex items-center justify-center bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer">
            <svg className={`w-5 h-5 transition-transform ${isOpen ? "" : "rotate-180"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-3.5 py-2 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.filter(item => !(item.id === 'katalog' && status === 'active')).map((item) => {
            const isActive = activeTab === item.id;
            return (
              <div key={item.id} onClick={() => handleMenuClick(item)} className="cursor-pointer group">
                <motion.div
                  whileHover={{ x: 4 }} whileTap={{ scale: 0.97 }}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 font-bold ${
                    isActive ? btnUserPrimary : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-100"
                  } ${!isOpen ? "justify-center" : ""}`}
                >
                  <div className={`${isActive ? "text-white" : "text-slate-500 group-hover:text-cyan-400"}`}>{item.icon}</div>
                  {isOpen && <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="whitespace-nowrap text-sm">{item.label}</motion.span>}
                </motion.div>
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className={`flex items-center ${isOpen ? "justify-between" : "justify-center"} bg-slate-800 p-2.5 rounded-xl cursor-pointer`} onClick={() => setShowProfile(!showProfile)}>
            {isOpen ? (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold shrink-0">{avatarLetter}</div>
                <div className="text-left overflow-hidden">
                  <p className="text-sm font-bold text-slate-200 truncate">{displayName}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{displayRole}</p>
                </div>
              </div>
            ) : (
              <div className="w-9 h-9 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold shrink-0">{avatarLetter}</div>
            )}
            {isOpen && (
              <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}

export default SidebarUser;
