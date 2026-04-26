import { useState, useCallback } from "react";
import api from "../api";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

export const usePenyewa = () => {
  const [penyewa, setPenyewa] = useState([]);
  const [kamar, setKamar] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPenyewa = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/penyewa");
      setPenyewa(res.data);
    } catch (error) {
      console.error("Gagal mengambil data penyewa", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchKamar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/kamar");
      setKamar(res.data);
    } catch (error) {
      console.error("Gagal mengambil data kamar", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const savePenyewa = async (formData, editId) => {
    try {
      if (editId) {
        await api.put(
          `/api/penyewa/${editId}`,
          formData,
        );
        toast.success("Data penyewa berhasil diperbarui.");
      } else {
        await api.post("/api/penyewa", formData);
        toast.success("Data penyewa baru berhasil ditambahkan.");
      }
      await fetchPenyewa();
      await fetchKamar();
      return true;
    } catch (error) {
      console.error("Gagal menyimpan data penyewa", error);
      toast.error("Terjadi kesalahan saat menyimpan data penyewa.");
      return false;
    }
  };

  const deletePenyewa = async (id) => {
    const result = await Swal.fire({
      title: "Hapus Penyewa?",
      text: "Data penyewa akan dihapus permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#9ca3af",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/api/penyewa/${id}`);
        toast.success("Data penyewa berhasil dihapus.");
        await fetchPenyewa();
        await fetchKamar();
      } catch (error) {
        const statusCode = error.response?.status;
        const serverMessage = error.response?.data?.message || "";

        if (statusCode === 500 || serverMessage.includes("foreign key")) {
          Swal.fire({
            title: "Gagal Menghapus!",
            html: `
              <div class="text-left text-sm">
                <p class="mb-2 font-bold text-red-600">Penyewa ini masih memiliki riwayat transaksi.</p>
                <p class="mb-1">Silakan ikuti langkah berikut:</p>
                <ol class="list-decimal ml-5 space-y-1 text-gray-700">
                  <li>Buka menu <b>Pembayaran</b>.</li>
                  <li>Hapus semua catatan pembayaran atas nama penyewa ini.</li>
                  <li>Kembali ke sini dan coba hapus lagi.</li>
                </ol>
              </div>
            `,
            icon: "error",
            confirmButtonColor: "#4f46e5",
            confirmButtonText: "Saya Mengerti",
          });
        } else {
          toast.error("Gagal menghapus data penyewa.");
        }
        console.error("Detail Error:", error);
      }
    }
  };

  return {
    penyewa,
    kamar,
    loading,
    fetchPenyewa,
    fetchKamar,
    savePenyewa,
    deletePenyewa,
  };
};
