import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  modalVariants,
  overlayVariants,
  hoverClick,
} from "../../utils/animations";
import {
  inputStyle,
  labelStyle,
  btnPrimary,
  btnAmber,
} from "../../utils/theme";

const PengeluaranModal = ({
  isOpen,
  onClose,
  onSubmit,
  editId,
  form,
  setForm,
}) => {
  const [isKategoriOpen, setIsKategoriOpen] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleClose = () => {
    setIsKategoriOpen(false);
    onClose();
  };

  const kategoriOptions = [
    "Listrik",
    "Air",
    "Perbaikan",
    "Operasional",
    "Lainnya",
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 max-w-md w-full max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-800">
                  {editId ? "Edit Pengeluaran" : "Tambah Pengeluaran"}
                </h2>
                <button
                  onClick={handleClose}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={onSubmit} className="space-y-6">
                <div>
                  <label className={labelStyle}>Tanggal Pengeluaran</label>
                  <input
                    type="date"
                    name="tanggal"
                    value={form.tanggal}
                    onChange={handleChange}
                    required
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className={labelStyle}>Nama/Keterangan</label>
                  <input
                    type="text"
                    name="keterangan"
                    value={form.keterangan}
                    onChange={handleChange}
                    placeholder="Masukkan nama atau keterangan pengeluaran"
                    required
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className={labelStyle}>Kategori</label>
                  <div className="relative">
                    {/* Hidden select buat validasi required HTML */}
                    <select
                      name="kategori"
                      value={form.kategori}
                      onChange={handleChange}
                      required
                      className="absolute opacity-0 w-full h-full -z-10 pointer-events-none"
                      tabIndex={-1}
                    >
                      <option value="">Pilih Kategori</option>
                      {kategoriOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>

                    {/* Tombol trigger custom dropdown */}
                    <button
                      type="button"
                      onClick={() => setIsKategoriOpen(!isKategoriOpen)}
                      className={`${inputStyle} w-full text-left flex justify-between items-center ${
                        !form.kategori ? "text-slate-400" : "text-slate-700"
                      }`}
                    >
                      {form.kategori || "Pilih Kategori"}
                      <motion.span
                        animate={{ rotate: isKategoriOpen ? 180 : 0 }}
                        className="text-[10px] opacity-60"
                      >
                        ▼
                      </motion.span>
                    </button>

                    {/* Dropdown menu */}
                    <AnimatePresence>
                      {isKategoriOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full mt-2 left-0 right-0 z-50 bg-white border border-slate-100 shadow-xl rounded-2xl"
                        >
                          {/* INI BAGIAN YANG BIKIN GAK NGOTAK BRO (p-2 & flex flex-col gap-1) */}
                          <div className="p-2 flex flex-col gap-1">
                            {kategoriOptions.map((option) => (
                              <button
                                key={option}
                                type="button"
                                onClick={() => {
                                  setForm({ ...form, kategori: option });
                                  setIsKategoriOpen(false);
                                }}
                                // (rounded-xl) biar hovernya melengkung
                                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors ${
                                  form.kategori === option
                                    ? "bg-indigo-50 text-indigo-600 font-bold"
                                    : "hover:bg-slate-50 text-slate-600"
                                }`}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div>
                  <label className={labelStyle}>Nominal</label>
                  <input
                    type="number"
                    name="jumlah"
                    value={form.jumlah}
                    onChange={handleChange}
                    placeholder="Masukkan nominal pengeluaran"
                    min="0"
                    required
                    className={inputStyle}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.button
                    variants={hoverClick}
                    whileHover="hover"
                    whileTap="tap"
                    type="submit"
                    className={`${btnPrimary} flex-1 py-3 text-sm font-bold`}
                  >
                    {editId ? "Update" : "Simpan"}
                  </motion.button>
                  <motion.button
                    variants={hoverClick}
                    whileHover="hover"
                    whileTap="tap"
                    type="button"
                    onClick={handleClose}
                    className={`${btnAmber} flex-1 py-3 text-sm font-bold`}
                  >
                    Batal
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PengeluaranModal;