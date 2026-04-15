import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

// Import Components, Hooks, & Theme
import Sidebar from "../../../components/Sidebar";
import KamarTable from "./KamarTable";
import KamarModal from "./KamarModal";
import { useKamar } from "../../../hooks/useKamar";
import { fadeInUp, hoverClick } from "../../../utils/animations";
import { btnPrimary, inputStyle } from "../../../utils/theme";

function Kamar() {
  const { kamar, fetchKamar, saveKamar, deleteKamar } = useKamar();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    nomor: "",
    tipe: "",
    harga: "",
    fasilitas: "",
    status: "kosong",
  });

  const [initialForm, setInitialForm] = useState(null);
  const [fasilitasList, setFasilitasList] = useState([]);

  // State Filter & Search
  const [statusFilter, setStatusFilter] = useState("semua");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "nomor",
    direction: "asc",
  });

  // State khusus buat buka-tutup Custom Dropdown Filter
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    fetchKamar();
  }, [fetchKamar]);

  const handleFasilitasChange = (e) => {
    const { value, checked } = e.target;
    const newList = checked
      ? [...fasilitasList, value]
      : fasilitasList.filter((item) => item !== value);

    setFasilitasList(newList);
    setForm((prev) => ({ ...prev, fasilitas: newList.join(", ") }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId && JSON.stringify(form) === JSON.stringify(initialForm)) {
      toast.info("Tidak ada perubahan data.");
      return closeModal();
    }
    const success = await saveKamar(form, editId);
    if (success) closeModal();
  };

  const handleEdit = (k) => {
    const dataEdit = {
      nomor: k.nomor,
      tipe: k.tipe,
      harga: String(k.harga),
      fasilitas: k.fasilitas || "",
      status: k.status || "kosong",
    };
    setForm(dataEdit);
    setInitialForm(dataEdit);
    setEditId(k.id);
    setFasilitasList(
      k.fasilitas ? k.fasilitas.split(", ").map((f) => f.trim()) : [],
    );
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditId(null);
    setInitialForm(null);
    setForm({
      nomor: "",
      tipe: "",
      harga: "",
      fasilitas: "",
      status: "kosong",
    });
    setFasilitasList([]);
  };

  // --- LOGIC: FILTER & SORT ---
  const processedData = [...kamar]
    .filter((k) => {
      const matchesSearch =
        (k.nomor || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (k.tipe || "").toLowerCase().includes(searchTerm.toLowerCase());

      const dbStatus = (k.status || "kosong").toLowerCase();
      let matchesStatus = false;

      if (statusFilter === "semua") {
        matchesStatus = true;
      } else if (statusFilter === "kosong") {
        matchesStatus = dbStatus === "kosong" || dbStatus === "tersedia";
      } else if (statusFilter === "terisi") {
        matchesStatus = dbStatus === "terisi";
      }

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let vA = a[sortConfig.key],
        vB = b[sortConfig.key];
      if (sortConfig.key === "harga") {
        vA = Number(vA);
        vB = Number(vB);
      }
      if (vA < vB) return sortConfig.direction === "asc" ? -1 : 1;
      if (vA > vB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key)
      return <span className="ml-1 opacity-30 text-[10px]">↕</span>;
    return sortConfig.direction === "asc" ? (
      <span className="ml-1 text-indigo-600 text-[10px]">▲</span>
    ) : (
      <span className="ml-1 text-indigo-600 text-[10px]">▼</span>
    );
  };

  // Label Dinamis buat Dropdown Filter
  const getFilterLabel = () => {
    if (statusFilter === "kosong") return "Tersedia (Kosong)";
    if (statusFilter === "terisi") return "Terisi";
    return "Semua Status";
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
              Room Manager
            </h1>
            <p className="text-slate-500 mt-1">Kelola unit kos Anda.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">

            {/* --- CUSTOM DROPDOWN FILTER (BEBAS KOTAK-KOTAK) --- */}
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
                    {/* Overlay transparan biar pas klik di luar dropdown nutup */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsFilterOpen(false)}
                    ></div>

                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 right-0 mt-2 z-20 bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden py-2"
                    >
                      {[
                        { val: "semua", label: "Semua Status" },
                        { val: "kosong", label: "Tersedia (Kosong)" },
                        { val: "terisi", label: "Terisi" },
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
            {/* --------------------------------------------------- */}

            <input
              type="text"
              placeholder="Cari unit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${inputStyle} md:w-64`}
            />

            <motion.button
              whileHover={hoverClick.whileHover}
              whileTap={hoverClick.whileTap}
              onClick={() => setIsModalOpen(true)}
              className={`${btnPrimary} px-6 py-3 whitespace-nowrap flex items-center justify-center gap-2 shadow-lg shadow-indigo-200`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
              Tambah Kamar
            </motion.button>
          </div>
        </div>

        <KamarTable
          data={processedData}
          onEdit={handleEdit}
          onDelete={deleteKamar}
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

        <KamarModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={handleSubmit}
          form={form}
          setForm={setForm}
          editId={editId}
          fasilitasList={fasilitasList}
          onFasilitasChange={handleFasilitasChange}
        />
      </motion.main>
    </div>
  );
}

export default Kamar;