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
import DaftarPindah from "./pages/Admin/PindahKamar/DaftarPindah";

// --- PROTECTED ROUTE: hanya user yang sudah login ---
function RequireUserLogin({ children }) {
  const token = localStorage.getItem("user_token");
  if (!token) return <Navigate to="/login-user" replace />;
  return children;
}

// --- GUEST ONLY ROUTE (user): redirect ke dashboard jika sudah login ---
function GuestOnlyRoute({ children }) {
  const token = localStorage.getItem("user_token");
  if (token && token !== "null" && token !== "undefined") {
    return <Navigate to="/dashboard-user" replace />;
  }
  return children;
}

// --- PROTECTED ROUTE: hanya admin yang sudah login ---
function RequireAdminLogin({ children }) {
  const token = localStorage.getItem("token");
  if (!token || token === "null" || token === "undefined") {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// --- ADMIN GUEST ONLY: redirect ke dashboard jika admin sudah login ---
function AdminGuestOnlyRoute({ children }) {
  const token = localStorage.getItem("token");
  if (token && token !== "null" && token !== "undefined") {
    return <Navigate to="/dashboard" replace />;
  }
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
        <Route
          path="/login-user"
          element={
            <GuestOnlyRoute>
              <LoginUser />
            </GuestOnlyRoute>
          }
        />
        <Route
          path="/dashboard-user"
          element={
            <RequireUserLogin>
              <DashboardUser />
            </RequireUserLogin>
          }
        />
        <Route
          path="/pesan"
          element={
            <GuestOnlyRoute>
              <PemesananUser />
            </GuestOnlyRoute>
          }
        />

        {/* ── HALAMAN ADMIN ── */}
        <Route path="/login" element={<AdminGuestOnlyRoute><Login /></AdminGuestOnlyRoute>} />
        <Route path="/dashboard" element={<RequireAdminLogin><Dashboard /></RequireAdminLogin>} />
        <Route path="/kamar" element={<RequireAdminLogin><Kamar /></RequireAdminLogin>} />
        <Route path="/penyewa" element={<RequireAdminLogin><Penyewa /></RequireAdminLogin>} />
        <Route path="/pembayaran" element={<RequireAdminLogin><Pembayaran /></RequireAdminLogin>} />
        <Route path="/pengeluaran" element={<RequireAdminLogin><Pengeluaran /></RequireAdminLogin>} />
        <Route path="/laporan" element={<RequireAdminLogin><Laporan /></RequireAdminLogin>} />
        <Route path="/pemesanan" element={<RequireAdminLogin><Pemesanan /></RequireAdminLogin>} />
        <Route path="/pindah-kamar" element={<RequireAdminLogin><DaftarPindah /></RequireAdminLogin>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
