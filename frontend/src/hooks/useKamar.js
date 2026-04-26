import { useState, useCallback } from "react";
import api from "../api";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

export const useKamar = () => {
  const [kamar, setKamar] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Ambil Data
  const fetchKamar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/kamar");
      setKamar(res.data);
    } catch (error) {
      console.error("Gagal ambil data", error);
      toast.error("Gagal sinkronisasi data.");
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Simpan atau Update
  const saveKamar = async (formData, editId) => {
    try {
      if (editId) {
        await api.put(`/api/kamar/${editId}`, formData);
        toast.success("Unit berhasil diperbarui!");
      } else {
        await api.post("/api/kamar", formData);
        toast.success("Unit baru ditambahkan!");
      }
      await fetchKamar();
      return true;
    } catch (error) {
      // Tangkep pesan error dari backend
      const pesan = error.response?.data?.message || "Gagal menyimpan data.";
      toast.error(pesan);
      return false;
    }
  };

  // 3. Hapus Data
  const deleteKamar = async (id) => {
    const result = await Swal.fire({
      title: "Hapus Kamar?",
      text: "Data yang dihapus tidak bisa dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4f46e5",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Ya, Hapus!",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/api/kamar/${id}`);
        toast.success("Kamar dihapus.");
        await fetchKamar();
      } catch (error) {
        Swal.fire("Gagal!", "Kamar ini masih terikat dengan penyewa.", "error");
      }
    }
  };

  return { kamar, loading, fetchKamar, saveKamar, deleteKamar };
};
