import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePengeluaran } from "../../../hooks/usePengeluaran";
import Sidebar from "../../../components/Sidebar";
import PengeluaranTable from "./PengeluaranTable";
import PengeluaranModal from "./PengeluaranModal";
import { toast } from "react-toastify";
import Swal from "sweetalert2"; // <-- 1. IMPORT SWEETALERT DI SINI
import { fadeInUp, hoverClick } from "../../../utils/animations";
import { btnPrimary } from "../../../utils/theme";

function Pengeluaran() {
  const { pengeluaran, fetchPengeluaran, savePengeluaran, deletePengeluaran } = usePengeluaran();

  const [form, setForm] = useState({
    tanggal: "",
    keterangan: "",
    kategori: "",
    jumlah: "",
  });

  const [initialForm, setInitialForm] = useState(null);
  const [editId, setEditId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState("semua");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: "tanggal",
    direction: "desc",
  });

  useEffect(() => {
    fetchPengeluaran();
  }, [fetchPengeluaran]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId && JSON.stringify(form) === JSON.stringify(initialForm)) {
      toast.info("Tidak ada perubahan data pada formulir.");
      closeModal();
      return;
    }

    const success = await savePengeluaran(form, editId);
    if (success) {
      closeModal();
    }
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setForm({
      tanggal: item.tanggal.split("T")[0], // Format YYYY-MM-DD
      keterangan: item.keterangan,
      kategori: item.kategori,
      jumlah: item.jumlah,
    });
    setInitialForm({
      tanggal: item.tanggal.split("T")[0],
      keterangan: item.keterangan,
      kategori: item.kategori,
      jumlah: item.jumlah,
    });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditId(null);
    setForm({
      tanggal: "",
      keterangan: "",
      kategori: "",
      jumlah: "",
    });
    setInitialForm(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditId(null);
    setForm({
      tanggal: "",
      keterangan: "",
      kategori: "",
      jumlah: "",
    });
    setInitialForm(null);
  };

  // <-- 2. TAMBAHIN FUNGSI WRAPPER SWEETALERT DI SINI -->
  const handleDelete = (id) => {
    Swal.fire({
      title: "Hapus Riwayat?",
      text: "Data pengeluaran ini akan dihapus permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      customClass: {
        popup: "rounded-3xl", // Biar ujungnya melengkung kayak di desain lu
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        await deletePengeluaran(id); // Panggil fungsi delete dari hook kalau di-klik "Ya"
      }
    });
  };

  const filteredData = pengeluaran.filter((item) => {
    const matchesSearch = item.keterangan
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesKategori =
      kategoriFilter === "semua" || item.kategori === kategoriFilter;
    return matchesSearch && matchesKategori;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (sortConfig.key === "tanggal") {
      return sortConfig.direction === "asc"
        ? new Date(aValue) - new Date(bValue)
        : new Date(bValue) - new Date(aValue);
    }

    if (sortConfig.key === "jumlah") {
      return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
    }

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key)
      return <span className="ml-1 opacity-30 text-[10px]">↕</span>;
    return sortConfig.direction === "asc" ? (
      <span className="ml-1 text-indigo-600 text-[10px]">▲</span>
    ) : (
      <span className="ml-1 text-indigo-600 text-[10px]">▼</span>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />
      <motion.main
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="flex-1 p-4 md:p-10 pb-20 md:pb-10 overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight">
              Pengeluaran
            </h1>
            <p className="text-slate-500 mt-1">Kelola data pengeluaran kost</p>
          </div>
          <motion.button
            whileHover={hoverClick.whileHover}
            whileTap={hoverClick.whileTap}
            onClick={handleAdd}
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-200 whitespace-nowrap"
          >
            + Tambah Pengeluaran
          </motion.button>
        </div>

        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Cari pengeluaran..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-3 bg-white rounded-2xl border border-slate-200 shadow-sm focus:ring-4 focus:ring-indigo-50:ring-indigo-500/20 outline-none text-slate-800 placeholder-slate-400"
          />
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="px-4 py-3 bg-white rounded-2xl border border-slate-200 shadow-sm hover:bg-slate-50:bg-slate-700 font-medium text-slate-600"
            >
              {kategoriFilter === "semua" ? "Filter Kategori" : kategoriFilter}{" "}
              ▼
            </button>
            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 z-50"
                >
                  <div className="p-2">
                    {[
                      "semua",
                      "Listrik",
                      "Air",
                      "Perbaikan",
                      "Operasional",
                      "Lainnya",
                    ].map((kat) => (
                      <button
                        key={kat}
                        onClick={() => {
                          setKategoriFilter(kat);
                          setIsFilterOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-sm ${
                          kategoriFilter === kat
                            ? "bg-indigo-50 text-indigo-600 font-bold"
                            : "hover:bg-slate-50:bg-slate-700/50 text-slate-600"
                        }`}
                      >
                        {kat === "semua" ? "Semua Kategori" : kat}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <PengeluaranTable
          data={sortedData}
          onEdit={handleEdit}
          onDelete={handleDelete} // <-- 3. TEMBAK PROPS ONDELETE KE FUNGSI BARU
          renderSortIcon={renderSortIcon}
          onSort={handleSort}
        />
      </motion.main>

      <PengeluaranModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        editId={editId}
        form={form}
        setForm={setForm}
      />
    </div>
  );
}

export default Pengeluaran;