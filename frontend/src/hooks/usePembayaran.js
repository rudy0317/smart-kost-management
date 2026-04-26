import { useState, useCallback } from "react";
import api from "../api";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

export const usePembayaran = () => {
  const [pembayaran, setPembayaran] = useState([]);
  const [penyewa, setPenyewa] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPembayaran = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("http://localhost:5000/api/pembayaran");
      setPembayaran(res.data);
    } catch (error) {
      console.error("Gagal mengambil data pembayaran", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPenyewa = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("http://localhost:5000/api/penyewa");
      setPenyewa(res.data);
    } catch (error) {
      console.error("Gagal mengambil data penyewa", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const savePembayaran = async (formData, editId) => {
    try {
      if (editId) {
        await api.put(
          `http://localhost:5000/api/pembayaran/${editId}`,
          formData,
        );
        toast.success("Data pembayaran berhasil diperbarui.");
      } else {
        await api.post("http://localhost:5000/api/pembayaran", formData);
        toast.success("Pembayaran baru berhasil dicatat.");
      }
      await fetchPembayaran();
      return true;
    } catch (error) {
      console.error("Gagal menyimpan pembayaran", error);
      toast.error("Terjadi kesalahan saat menyimpan data pembayaran.");
      return false;
    }
  };

  const deletePembayaran = async (id) => {
    const result = await Swal.fire({
      title: "Hapus Riwayat?",
      text: "Data pembayaran ini akan dihapus permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#9ca3af",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`http://localhost:5000/api/pembayaran/${id}`);
        toast.success("Catatan pembayaran dihapus.");
        await fetchPembayaran();
      } catch (error) {
        console.error("Gagal menghapus pembayaran", error);
        toast.error("Terjadi kesalahan saat menghapus data.");
      }
    }
  };

  const statusColor = (status) => {
    if (status === "lunas")
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (status === "terlambat") return "bg-red-100 text-red-800 border-red-200";
    return "bg-amber-100 text-amber-800 border-amber-200";
  };

  const formatBulanDisplay = (bulanStr) => {
    if (!bulanStr) return "-";
    if (bulanStr.includes("-") && bulanStr.split("-")[0].length === 4) {
      try {
        const parts = bulanStr.split("-");
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const date = new Date(year, month);
        if (isNaN(date.getTime())) return bulanStr;
        return new Intl.DateTimeFormat("id-ID", {
          month: "long",
          year: "numeric",
        }).format(date);
      } catch {
        return bulanStr;
      }
    }
    return bulanStr;
  };

  return {
    pembayaran,
    penyewa,
    loading,
    fetchPembayaran,
    fetchPenyewa,
    savePembayaran,
    deletePembayaran,
    statusColor,
    formatBulanDisplay,
  };
};
