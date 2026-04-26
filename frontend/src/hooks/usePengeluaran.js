import { useState, useCallback } from "react";
import api from "../api";
import { toast } from "react-toastify";

export const usePengeluaran = () => {
  const [pengeluaran, setPengeluaran] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPengeluaran = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/pengeluaran");
      setPengeluaran(res.data);
    } catch (error) {
      console.error("Gagal mengambil data pengeluaran", error);
      toast.error("Gagal mengambil data pengeluaran");
    } finally {
      setLoading(false);
    }
  }, []);

  const savePengeluaran = async (formData, editId) => {
    try {
      if (editId) {
        await api.put(
          `/api/pengeluaran/${editId}`,
          formData,
        );
        toast.success("Data pengeluaran berhasil diperbarui.");
      } else {
        await api.post("/api/pengeluaran", formData);
        toast.success("Data pengeluaran baru berhasil ditambahkan.");
      }
      await fetchPengeluaran();
      return true;
    } catch (error) {
      console.error("Gagal menyimpan data pengeluaran", error);
      toast.error("Gagal menyimpan data pengeluaran");
      return false;
    }
  };

  // Tambahin fungsi ini di dalam hook usePengeluaran lu:
const deletePengeluaran = async (id) => {
  try {
    await api.delete(`/api/pengeluaran/${id}`); // Sesuaikan URL API lu
    setPengeluaran(pengeluaran.filter((item) => item.id !== id));
    toast.success("Data pengeluaran berhasil dihapus!");
  } catch (error) {
    console.error("Error deleting data:", error);
    toast.error("Gagal menghapus data pengeluaran.");
  }
};


  return {
    pengeluaran,
    loading,
    fetchPengeluaran,
    savePengeluaran,
    deletePengeluaran,
  };
};
