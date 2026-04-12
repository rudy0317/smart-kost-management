import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { usePembayaran } from "../../../hooks/usePembayaran";
import Sidebar from "../../../components/Sidebar";
import PembayaranTable from "./PembayaranTable";
import PembayaranModal from "./PembayaranModal";
import { toast } from "react-toastify";
import { fadeInUp, hoverClick } from "../../../utils/animations";
import { btnPrimary, inputStyle } from "../../../utils/theme";

function Pembayaran() {
  const {
    pembayaran,
    penyewa,
    fetchPembayaran,
    fetchPenyewa,
    savePembayaran,
    deletePembayaran,
    statusColor,
    formatBulanDisplay,
  } = usePembayaran();

  const [form, setForm] = useState({
    id_penyewa: "",
    kategori: "Sewa Kamar",
    metode_bayar: "Transfer",
    bulan: "",
    jumlah: "",
    tanggal_bayar: new Date().toISOString().slice(0, 10),
    status: "lunas",
  });

  const [initialForm, setInitialForm] = useState(null);
  const [editId, setEditId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "tanggal_bayar",
    direction: "desc",
  });

  useEffect(() => {
    fetchPembayaran();
    fetchPenyewa();
  }, [fetchPembayaran, fetchPenyewa]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId && JSON.stringify(form) === JSON.stringify(initialForm)) {
      toast.info("Tidak ada perubahan data pada formulir.");
      closeModal();
      return;
    }

    const success = await savePembayaran(form, editId);
    if (success) {
      closeModal();
    }
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    const editData = {
      id_penyewa: item.id_penyewa.toString(),
      kategori: item.kategori || "Sewa Kamar",
      metode_bayar: item.metode_bayar || "Transfer",
      bulan: item.bulan,
      jumlah: item.jumlah,
      tanggal_bayar: item.tanggal_bayar ? item.tanggal_bayar.slice(0, 10) : "",
      status: item.status,
    };
    setForm(editData);
    setInitialForm(editData);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    deletePembayaran(id);
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const openAddModal = () => {
    setEditId(null);
    setInitialForm(null);
    setForm({
      id_penyewa: "",
      kategori: "Sewa Kamar",
      metode_bayar: "Transfer",
      bulan: "",
      jumlah: "",
      tanggal_bayar: new Date().toISOString().slice(0, 10),
      status: "lunas",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditId(null);
    setInitialForm(null);
  };

  const processedData = [...pembayaran]
    .filter((item) => {
      const search = searchTerm.toLowerCase();
      return (
        (item.nama_penyewa &&
          item.nama_penyewa.toLowerCase().includes(search)) ||
        (item.nomor_kamar &&
          item.nomor_kamar.toString().toLowerCase().includes(search)) ||
        (item.kategori && item.kategori.toLowerCase().includes(search)) ||
        (item.status && item.status.toLowerCase().includes(search)) ||
        (item.bulan &&
          formatBulanDisplay(item.bulan).toLowerCase().includes(search))
      );
    })
    .sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];

      if (sortConfig.key === "tanggal_bayar" || sortConfig.key === "bulan") {
        valA = valA ? new Date(valA).getTime() : 0;
        valB = valB ? new Date(valB).getTime() : 0;
      } else if (sortConfig.key === "jumlah") {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      }

      if (!valA) valA = "";
      if (!valB) valB = "";

      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

  const renderSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey)
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
        className="flex-1 p-10"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">
              Pembayaran Sewa
            </h1>
            <p className="text-slate-500 mt-1">
              Kelola pendapatan dari penyewa kamar.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Cari penyewa, kamar, status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${inputStyle} md:w-64`}
            />

            <motion.button
              whileHover={hoverClick.whileHover}
              whileTap={hoverClick.whileTap}
              onClick={openAddModal}
              className={`${btnPrimary} px-6 py-3 flex items-center justify-center gap-2`}
            >
              + Catat Pembayaran
            </motion.button>
          </div>
        </div>

        <PembayaranTable
          data={processedData}
          onEdit={handleEdit}
          onDelete={handleDelete}
          renderSortIcon={renderSortIcon}
          onSort={handleSort}
          formatBulanDisplay={formatBulanDisplay}
          statusColor={statusColor}
        />

        <PembayaranModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={handleSubmit}
          editId={editId}
          form={form}
          setForm={setForm}
          penyewa={penyewa}
          initialForm={initialForm}
        />
      </motion.main>
    </div>
  );
}

export default Pembayaran;
