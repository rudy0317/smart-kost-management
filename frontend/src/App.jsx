import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// --- GUEST PAGES (public, tidak butuh login) ---
import LandingPage from "./pages/Guest/LandingPage";
import KatalogGuest from "./pages/Guest/KatalogGuest";

// --- USER PAGES (role: penyewa) ---
import LoginUser from "./pages/User/LoginUser";
import PemesananUser from "./pages/User/PemesananUser";
import DashboardUser from "./pages/User/DashboardUser";

// --- ADMIN PAGES ---
import Login from "./pages/Admin/Login";
import Dashboard from "./pages/Admin/Dashboard";
import Kamar from "./pages/Admin/Kamar";
import Penyewa from "./pages/Admin/Penyewa";
import Pembayaran from "./pages/Admin/Pembayaran";
import Pengeluaran from "./pages/Admin/Pengeluaran";
import Laporan from "./pages/Admin/Laporan";
import Pemesanan from "./pages/Admin/Pemesanan";

// --- PROTECTED ROUTE: hanya user yang sudah login ---
function RequireUserLogin({ children }) {
  const token = localStorage.getItem("user_token");
  if (!token) return <Navigate to="/login-user" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />

      <Routes>
        {/* ── HALAMAN PUBLIC (Guest) ── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/katalog" element={<KatalogGuest />} />

        {/* ── HALAMAN USER (butuh login user) ── */}
        <Route path="/login-user" element={<LoginUser />} />
        <Route
          path="/dashboard-user"
          element={
            <RequireUserLogin>
              <DashboardUser />
            </RequireUserLogin>
          }
        />
        <Route path="/pesan" element={<PemesananUser />} />

        {/* ── HALAMAN ADMIN ── */}
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
