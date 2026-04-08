import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePenyewa } from "../../hooks/usePenyewa";
import Sidebar from "../../components/Sidebar";
import PenyewaTable from "./PenyewaTable";
import PenyewaModal from "./PenyewaModal";
import { toast } from "react-toastify";
import { fadeInUp, hoverClick } from "../../utils/animations";
import { btnPrimary, inputStyle } from "../../utils/theme";

function Penyewa() {
  const { penyewa, kamar, fetchPenyewa, fetchKamar, savePenyewa, deletePenyewa } = usePenyewa();

  const [form, setForm] = useState({
    nama: "",
    no_hp: "",
    id_kamar: "",
    tanggal_masuk: "",
  });

  const [initialForm, setInitialForm] = useState(null);
  const [editId, setEditId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: "nama",
    direction: "asc",
  });

  useEffect(() => {
    fetchPenyewa();
    fetchKamar();
  }, [fetchPenyewa, fetchKamar]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId && JSON.stringify(form) === JSON.stringify(initialForm)) {
      toast.info("Tidak ada perubahan data pada formulir.");
      closeModal();
      return;
    }

    const success = await savePenyewa(form, editId);
    if (success) {
      closeModal();
    }
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    const editData = {
      nama: item.nama,
      no_hp: item.no_hp,
      id_kamar: item.id_kamar,
      tanggal_masuk: item.tanggal_masuk ? item.tanggal_masuk.slice(0, 10) : "",
    };
    setForm(editData);
    setInitialForm(editData);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    deletePenyewa(id);
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
    setForm({ nama: "", no_hp: "", id_kamar: "", tanggal_masuk: "" });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditId(null);
    setInitialForm(null);
  };

  const processedData = [...penyewa]
    .filter((p) => {
      const matchesSearch =
        p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.no_hp.includes(searchTerm) ||
        (p.nomor_kamar && p.nomor_kamar.toString().includes(searchTerm));

      const matchesStatus =
        statusFilter === "semua" ||
        (statusFilter === "aktif" && p.status === "aktif") ||
        (statusFilter === "nonaktif" && p.status !== "aktif");

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];
      if (sortConfig.key === "tanggal_masuk") {
        valA = valA ? new Date(valA).getTime() : 0;
        valB = valB ? new Date(valB).getTime() : 0;
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

  const getFilterLabel = () => {
    if (statusFilter === "semua") return "Semua Status";
    if (statusFilter === "aktif") return "Aktif";
    return "Keluar/Nonaktif";
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
              Data Penyewa
            </h1>
            <p className="text-slate-500 mt-1">
              Kelola penyewa kost Anda secara efisien.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* --- CUSTOM DROPDOWN FILTER --- */}
            <div className="relative z-20">
              <div
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`${inputStyle} md:w-56 flex items-center justify-between cursor-pointer font-bold text-slate-600 select-none`}
              >
                <span>{getFilterLabel()}</span>
                <svg
                  className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${
                    isFilterOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              <AnimatePresence>
                {isFilterOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 right-0 mt-2 z-20 bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden py-2"
                    >
                      {[
                        { val: "semua", label: "Semua Status" },
                        { val: "aktif", label: "Aktif" },
                        { val: "nonaktif", label: "Keluar/Nonaktif" },
                      ].map((item) => (
                        <div
                          key={item.val}
                          onClick={() => {
                            setStatusFilter(item.val);
                            setIsFilterOpen(false);
                          }}
                          className={`px-5 py-3 cursor-pointer text-sm font-bold transition-colors flex items-center justify-between ${
                            statusFilter === item.val
                              ? "bg-indigo-50/80 text-indigo-600"
                              : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                          }`}
                        >
                          {item.label}
                          {statusFilter === item.val && (
                            <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <input
              type="text"
              placeholder="Cari penyewa..."
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
              + Tambah Penyewa
            </motion.button>
          </div>
        </div>

        <PenyewaTable
          data={processedData}
          onEdit={handleEdit}
          onDelete={handleDelete}
          renderSortIcon={renderSortIcon}
          onSort={handleSort}
        />

        <PenyewaModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={handleSubmit}
          editId={editId}
          form={form}
          setForm={setForm}
          kamar={kamar}
          initialForm={initialForm}
        />
      </motion.main>
    </div>
  );
}

export default Penyewa;