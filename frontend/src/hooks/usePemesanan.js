import { useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

export const usePemesanan = () => {
  const [pemesanan, setPemesanan] = useState([]);
  const [kosongKamar, setKosongKamar] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPemesanan = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/pemesanan");
      setPemesanan(res.data);
    } catch (err) {
      toast.error("Gagal sinkronisasi data pemesanan.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchKosongKamar = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/kamar");
      setKosongKamar(
        res.data.filter(
          (k) =>
            (k.status || "").toLowerCase() === "kosong" ||
            (k.status || "").toLowerCase() === "tersedia",
        ),
      );
    } catch (error) {
      console.error("Gagal ambil kamar kosong:", err);
    }
  }, []);

  const savePemesanan = async (formData) => {
    try {
      await axios.post("http://localhost:5000/api/pemesanan", formData);
      toast.success("Pemesanan baru ditambahkan!");
      await fetchPemesanan();
      await fetchKosongKamar();
      return true;
    } catch (error) {
      toast.error("Gagal menyimpan pemesanan.");
      return false;
    }
  };

  const updateStatus = async (id, status) => {
    try {
      if (status === "menunggu_pembayaran") {
        await axios.post(`http://localhost:5000/api/pemesanan/${id}/setuju`);
        toast.success("Pemesanan disetujui! Menunggu pembayaran.");
      } else if (status === "ditolak") {
        await axios.put(`http://localhost:5000/api/pemesanan/${id}/tolak`);
        toast.success("Pemesanan ditolak.");
      }
      await fetchPemesanan();
      return true;
    } catch (error) {
      const pesan = error.response?.data?.pesan || "Gagal update status.";
      toast.error(pesan);
      return false;
    }
  };

  const sinyalBayar = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/pemesanan/${id}/sinyal-bayar`);
      toast.success("Konfirmasi pembayaran terkirim! Admin akan segera memverifikasi.");
      await fetchPemesanan();
      return true;
    } catch (error) {
      toast.error("Gagal mengirim sinyal pembayaran.");
      return false;
    }
  };

  const konfirmasiBayar = async (id, metode_bayar) => {
    try {
      const res = await axios.post(`http://localhost:5000/api/pemesanan/${id}/konfirmasi-bayar`, { metode_bayar });
      
      await fetchPemesanan();
      await fetchKosongKamar();

      // Jika backend mengembalikan info akun baru (guest yang baru dibuatkan akun)
      if (res.data?.new_account) {
        const { email, no_hp, nama } = res.data.new_account;
        await Swal.fire({
          title: 'Pembayaran Dikonfirmasi',
          html: `
            <div style="text-align:left; font-family:'Inter',sans-serif;">
              <p style="color:#475569; margin-bottom:16px; font-size:14px;">
                Akun otomatis telah dibuat untuk <strong style="color:#1e293b;">${nama}</strong>. 
                Sistem telah mengaktifkan penyewa & mencatat transaksi.
              </p>
              <div style="background:#f1f5f9; border:1px solid #e2e8f0; border-radius:12px; padding:16px; margin-bottom:12px;">
                <p style="font-size:12px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:8px;">Detail Login Penyewa</p>
                <div style="display:flex; flex-direction:column; gap:10px;">
                  <div>
                    <p style="font-size:11px; color:#94a3b8; margin-bottom:2px;">Email / Username</p>
                    <div style="background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:10px 12px; font-family:monospace; font-size:13px; font-weight:600; color:#4f46e5;">${email}</div>
                  </div>
                  <div>
                    <p style="font-size:11px; color:#94a3b8; margin-bottom:2px;">Password (No. HP)</p>
                    <div style="background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:10px 12px; font-family:monospace; font-size:13px; font-weight:600; color:#4f46e5;">${no_hp}</div>
                  </div>
                </div>
              </div>
              <p style="font-size:12px; color:#94a3b8; text-align:center;">
                Berikan info ini kepada penyewa untuk akses dashboard.
              </p>
            </div>
          `,
          icon: 'success',
          confirmButtonText: 'Selesai',
          confirmButtonColor: '#4f46e5',
          width: '480px',
          customClass: {
            popup: 'rounded-[1.5rem] shadow-2xl',
            confirmButton: 'rounded-xl px-10 py-3 font-bold',
          },
        });
      } else {
        await Swal.fire({
          title: 'Pembayaran Disetujui!',
          text: 'Status penyewa kini telah Aktif dan transaksi pembayaran sudah tercatat otomatis.',
          icon: 'success',
          confirmButtonText: 'Mantap!',
          confirmButtonColor: '#10b981',
          customClass: {
            popup: 'rounded-[1.5rem] shadow-2xl',
            confirmButton: 'rounded-xl px-10 py-3 font-bold',
          },
        });
      }

      return true;
    } catch (error) {
      const pesan = error.response?.data?.pesan || "Gagal konfirmasi pembayaran.";
      toast.error(pesan);
      return false;
    }
  };

  const deletePemesanan = async (id) => {
    const result = await Swal.fire({
      title: "Hapus Pemesanan?",
      text: "Data yang dihapus tidak bisa dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4f46e5",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Ya, Hapus!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:5000/api/pemesanan/${id}`);
        toast.success("Pemesanan dihapus.");
        await fetchPemesanan();
      } catch (err) {
        Swal.fire("Gagal!", "Pemesanan ini mungkin sudah diproses.", "error");
      }
    }
  };

  return {
    pemesanan,
    kosongKamar,
    loading,
    fetchPemesanan,
    fetchKosongKamar,
    savePemesanan,
    updateStatus,
    sinyalBayar,
    konfirmasiBayar,
    deletePemesanan,
  };
};
