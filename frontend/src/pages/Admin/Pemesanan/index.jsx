import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Import Components & Hooks
import Sidebar from "../../../components/Sidebar";
import PemesananTable from "./PemesananTable";
import PemesananModal from "./PemesananModal";
import { usePemesanan } from "../../../hooks/usePemesanan";
import { fadeInUp, hoverClick } from "../../../utils/animations";
import { btnPrimary, inputStyle } from "../../../utils/theme";
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronsUpDown, 
  Plus, 
  Search, 
  Check,
  Filter
} from "lucide-react";

function Pemesanan() {
  const {
    pemesanan,
    kosongKamar,
    fetchPemesanan,
    fetchKosongKamar,
    savePemesanan,
    updateStatus,
    konfirmasiBayar,
    deletePemesanan,
  } = usePemesanan();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    nama: "",
    no_hp: "",
    id_kamar: "",
    tanggal_masuk: "",
    status: "pending",
  });

  const [statusFilter, setStatusFilter] = useState("semua");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "tanggal_masuk",
    direction: "desc",
  });

  useEffect(() => {
    fetchPemesanan();
    fetchKosongKamar();
  }, [fetchPemesanan, fetchKosongKamar]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await savePemesanan(form);
    if (success) {
      closeModal();
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setForm({
      nama: "",
      no_hp: "",
      id_kamar: "",
      tanggal_masuk: "",
      status: "pending",
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Label Dinamis buat Dropdown Filter
  const getFilterLabel = () => {
    if (statusFilter === "semua") return "Semua Status";
    if (statusFilter === "pending") return "Pending";
    if (statusFilter === "menunggu_pembayaran") return "Menunggu Pembayaran";
    if (statusFilter === "disetujui") return "Disetujui";
    if (statusFilter === "ditolak") return "Ditolak";
    return "Semua Status";
  };

  // Filter & Sort Logic
  const processedData = pemesanan
    .filter((p) => {
      const matchesSearch =
        (p.nama || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.no_hp || "").toLowerCase().includes(searchTerm.toLowerCase());

      const dbStatus = (p.status || "pending").toLowerCase();
      let matchesStatus = statusFilter === "semua" || dbStatus === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let vA = a[sortConfig.key] || "";
      let vB = b[sortConfig.key] || "";
      if (sortConfig.key === "tanggal_masuk") {
        vA = new Date(vA).getTime();
        vB = new Date(vB).getTime();
      }
      if (vA < vB) return sortConfig.direction === "asc" ? -1 : 1;
      if (vA > vB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key)
      return <ChevronsUpDown className="inline ml-1 opacity-30" size={12} />;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="inline ml-1 text-indigo-600" size={12} />
    ) : (
      <ChevronDown className="inline ml-1 text-indigo-600" size={12} />
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
              Booking Manager
            </h1>
            <p className="text-slate-500 mt-1">
              Kelola pemesanan calon penyewa.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* --- CUSTOM DROPDOWN FILTER --- */}
            <div className="relative z-20">
              <div
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`${inputStyle} md:w-56 flex items-center justify-between cursor-pointer font-bold text-slate-600 select-none group`}
              >
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                  <span>{getFilterLabel()}</span>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-slate-400 transition-transform duration-300 ${
                    isFilterOpen ? "rotate-180" : ""
                  }`}
                />
              </div>

              <AnimatePresence>
                {isFilterOpen && (
                  <>
                    {/* Overlay transparan */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsFilterOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 right-0 mt-2 z-20 bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden py-2"
                    >
                      {[
                        { val: "semua", label: "Semua Status" },
                        { val: "pending", label: "Pending" },
                        { val: "menunggu_pembayaran", label: "Menunggu Bayar" },
                        { val: "disetujui", label: "Disetujui" },
                        { val: "ditolak", label: "Ditolak" },
                      ].map((item) => (
                        <div
                          key={item.val}
                          onClick={() => {
                            setStatusFilter(item.val);
                            setIsFilterOpen(false);
                          }}
                          className={`px-5 py-3 cursor-pointer text-sm font-bold flex items-center justify-between ${
                            statusFilter === item.val
                              ? "bg-indigo-50/80 text-indigo-600"
                              : "text-slate-500 hover:bg-slate-50:bg-slate-700/50 hover:text-slate-700:text-slate-300"
                          }`}
                        >
                          {item.label}
                          {statusFilter === item.val && (
                             <Check size={16} className="text-indigo-600" />
                          )}
                        </div>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            {/* ----------------------------------- */}

            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Cari nama atau nomor HP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${inputStyle} md:w-64 pl-12`}
              />
            </div>

            <motion.button
              whileHover={hoverClick.whileHover}
              whileTap={hoverClick.whileTap}
              onClick={() => setIsModalOpen(true)}
              className={`${btnPrimary} px-6 py-3 whitespace-nowrap flex items-center justify-center gap-2`}
            >
              <Plus size={20} />
              Tambah Manual
            </motion.button>
          </div>
        </div>

        <PemesananTable
          data={processedData}
          onUpdateStatus={updateStatus}
          onKonfirmasiBayar={konfirmasiBayar}
          onDelete={deletePemesanan}
          renderSortIcon={renderSortIcon}
          onSort={(key) =>
            setSortConfig({
              key,
              direction:
                sortConfig.key === key && sortConfig.direction === "asc"
                  ? "desc"
                  : "asc",
            })
          }
        />

        <PemesananModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={handleSubmit}
          form={form}
          setForm={setForm}
          kosongKamar={kosongKamar}
          onChange={handleChange}
        />
      </motion.main>
    </div>
  );
}

export default Pemesanan;
