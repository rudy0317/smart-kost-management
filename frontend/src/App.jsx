import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// --- IMPORT GUEST PAGES ---
import LandingPage from "./pages/LandingPage"; // Pastikan file ini ada!
import KatalogGuest from "./pages/KatalogGuest";
import PemesananPublik from "./pages/PemesananPublik";

// --- IMPORT ADMIN PAGES ---
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Kamar from "./pages/kamar";
import Penyewa from "./pages/Penyewa";
import Pembayaran from "./pages/Pembayaran";
import Pengeluaran from "./pages/Pengeluaran";
import Laporan from "./pages/Laporan";
import Pemesanan from "./pages/Pemesanan";

function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />

      <Routes>
        {/* --- HALAMAN UNTUK GUEST --- */}
        {/* Halaman utama sekarang adalah Landing Page */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/katalog" element={<KatalogGuest />} />
        <Route path="/pesan" element={<PemesananPublik />} />

        {/* --- HALAMAN ADMIN --- */}
        {/* Pindahkan login ke /login biar nggak tabrakan sama Landing Page */}
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/kamar" element={<Kamar />} />
        <Route path="/penyewa" element={<Penyewa />} />
        <Route path="/pembayaran" element={<Pembayaran />} />
        <Route path="/pengeluaran" element={<Pengeluaran />} />
        <Route path="/laporan" element={<Laporan />} />
        <Route path="/pemesanan" element={<Pemesanan />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
