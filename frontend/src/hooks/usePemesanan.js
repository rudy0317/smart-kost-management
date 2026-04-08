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
      if (status === "disetujui") {
        await axios.post(`http://localhost:5000/api/pemesanan/${id}/setuju`);
        toast.success("Pemesanan disetujui! Penyewa otomatis ditambahkan.");
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
    deletePemesanan,
  };
};
