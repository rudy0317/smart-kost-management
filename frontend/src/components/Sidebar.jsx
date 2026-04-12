import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";

function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const [adminData, setAdminData] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  // Fetch data admin dari /api/auth/me
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://localhost:5000/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.id) setAdminData(data);
      })
      .catch(() => {
        // fallback: decode dari token langsung
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          setAdminData({
            nama: payload.nama || payload.username || "Admin",
            email: payload.email || "-",
            username: payload.username || "admin",
          });
        } catch {}
      });
  }, []);

  const displayName = adminData?.nama || "Admin";
  const displayEmail = adminData?.email || "-";
  const displayUsername = adminData?.username || "admin";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  const menuItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      path: "/kamar",
      label: "Kamar",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
    },
    {
      path: "/pemesanan",
      label: "Pemesanan",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      path: "/penyewa",
      label: "Penyewa",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 005.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      path: "/pindah-kamar",
      label: "Req Pindah",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
      ),
    },
    {
      path: "/pembayaran",
      label: "Pembayaran",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      path: "/pengeluaran",
      label: "Pengeluaran",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z"
          />
        </svg>
      ),
    },
    {
      path: "/laporan",
      label: "Laporan",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0h6m2 0h2a2 2 0 002-2v-6a2 2 0 00-2-2h-2m-2 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4m6 4h-6"
          />
        </svg>
      ),
    },
  ];

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Yakin mau keluar?",
      text: "Sesi admin Anda akan diakhiri.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Keluar",
      cancelButtonText: "Batal",
    });
    if (result.isConfirmed) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  };

  return (
    <>
      {/* ── MODAL PROFILE ADMIN ── */}
      <AnimatePresence>
        {showProfile && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProfile(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed bottom-24 left-4 w-72 z-50"
            >
              <div className="bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header gradient */}
                <div className="h-16 bg-gradient-to-r from-indigo-600 to-cyan-600" />

                {/* Avatar + info */}
                <div className="px-5 pb-5">
                  {/* Avatar overlap */}
                  <div className="flex items-end gap-3 -mt-7 mb-4">
                    <div className="w-14 h-14 rounded-full bg-indigo-600 border-4 border-white flex items-center justify-center text-white text-xl font-black shadow-lg shrink-0">
                      {avatarLetter}
                    </div>
                    <span className="mb-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">
                      Super Admin
                    </span>
                  </div>

                  {/* Data rows */}
                  <div className="space-y-3">
                    {/* Nama */}
                    <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-3.5 py-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                        <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Nama</p>
                        <p className="text-sm font-bold text-slate-700">{displayName}</p>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-3.5 py-2.5">
                      <div className="w-7 h-7 rounded-lg bg-cyan-50 flex items-center justify-center shrink-0">
                        <svg className="w-3.5 h-3.5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Email</p>
                        <p className="text-sm font-bold text-slate-700 break-all">{displayEmail}</p>
                      </div>
                    </div>

                    {/* Username */}
                    <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-3.5 py-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                        <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Username</p>
                        <p className="text-sm font-bold text-slate-700">@{displayUsername}</p>
                      </div>
                    </div>
                  </div>

                  {/* Logout button */}
                  <button
                    onClick={handleLogout}
                    className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-sm transition-all border border-red-100"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Keluar
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── SIDEBAR UTAMA ── */}
      <motion.div
        animate={{ width: isOpen ? 256 : 80 }}
        transition={{ duration: 0.4, ease: "circOut" }}
        className="sticky top-0 h-screen bg-white flex flex-col z-40 shadow-xl overflow-hidden border-r border-slate-100 shrink-0"
      >
        {/* HEADER & TOMBOL TOGGLE */}
        <div
          className={`p-6 flex items-center mb-4 transition-all ${isOpen ? "justify-between" : "justify-center"}`}
        >
          <AnimatePresence>
            {isOpen && (
              <motion.h3
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 whitespace-nowrap"
              >
                KOST ASYNC
              </motion.h3>
            )}
          </AnimatePresence>

          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            animate={{ rotate: isOpen ? 0 : 180 }}
            className="w-8 h-8 shrink-0 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors cursor-pointer"
            title={isOpen ? "Sembunyikan Menu" : "Tampilkan Menu"}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </motion.button>
        </div>

        {/* LIST MENU NAVIGASI */}
        <nav className="flex-1 px-3.5 py-2 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="block outline-none group"
              >
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.97 }}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 font-bold ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  } ${!isOpen ? "justify-center" : ""}`}
                >
                  <div
                    className={`${isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-400"}`}
                  >
                    {item.icon}
                  </div>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {isActive && isOpen && (
                    <motion.span
                      layoutId="activePilot"
                      className="absolute right-6 w-1 h-5 bg-indigo-600 rounded-full"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* BAGIAN BAWAH: INFO ADMIN & LOGOUT */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div
            className={`flex items-center ${isOpen ? "justify-between" : "justify-center"} bg-white border border-slate-100 p-2.5 rounded-xl`}
          >
            {/* Info Admin — bisa diklik buat buka modal profile */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex items-center gap-3 overflow-hidden whitespace-nowrap"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowProfile(!showProfile)}
                    title="Lihat profil admin"
                    className="flex items-center gap-3 cursor-pointer group/avatar"
                  >
                    <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shrink-0 ring-2 ring-transparent group-hover/avatar:ring-indigo-400 transition-all">
                      {avatarLetter}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-700 group-hover/avatar:text-indigo-600 transition-colors">
                        {displayName}
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                        Super Admin
                      </p>
                    </div>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Avatar only saat sidebar collapsed */}
            {!isOpen && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowProfile(!showProfile)}
                title="Lihat profil admin"
                className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shrink-0 ring-2 ring-transparent hover:ring-indigo-400 transition-all cursor-pointer"
              >
                {avatarLetter}
              </motion.button>
            )}

            {/* Tombol Logout */}
            {isOpen && (
              <button
                onClick={handleLogout}
                className="w-9 h-9 shrink-0 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors group"
                title="Keluar / Logout"
              >
                <svg
                  className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}

export default Sidebar;
