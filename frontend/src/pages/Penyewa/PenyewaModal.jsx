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

const PenyewaModal = ({
  isOpen,
  onClose,
  onSubmit,
  editId,
  form,
  setForm,
  kamar,
}) => {
  const [isKamarOpen, setIsKamarOpen] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Helper untuk cari detail kamar yang dipilih
  const selectedKamar = kamar.find((k) => k.id === Number(form.id_kamar));

  const handleClose = () => {
    setIsKamarOpen(false);
    onClose();
  };

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
            className="relative bg-white w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-black text-slate-800">
                  {editId ? "Edit Penyewa" : "Tambah Penyewa Baru"}
                </h3>
                <p className="text-sm text-slate-400">
                  Lengkapi data penyewa kost Anda.
                </p>
              </div>
              <button
                onClick={handleClose}
                className="text-slate-300 hover:text-slate-500 transition-colors"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              {/* Nama */}
              <div className="space-y-1.5">
                <label className={labelStyle}>Nama Lengkap</label>
                <input
                  name="nama"
                  value={form.nama}
                  onChange={handleChange}
                  required
                  className={inputStyle}
                  placeholder="Contoh: John Doe"
                />
              </div>

              {/* No HP */}
              <div className="space-y-1.5">
                <label className={labelStyle}>No. HP / WhatsApp</label>
                <input
                  name="no_hp"
                  type="tel"
                  value={form.no_hp}
                  onChange={handleChange}
                  required
                  className={inputStyle}
                  placeholder="081234567890"
                />
              </div>

              {/* Custom Dropdown Kamar */}
              <div className="space-y-1.5 relative z-30">
                <label className={labelStyle}>Pilih Kamar</label>
                <div
                  onClick={() => setIsKamarOpen(!isKamarOpen)}
                  className={`${inputStyle} flex items-center justify-between cursor-pointer`}
                >
                  <span
                    className={
                      form.id_kamar
                        ? "text-slate-800 font-medium"
                        : "text-slate-400"
                    }
                  >
                    {selectedKamar
                      ? `Kamar ${selectedKamar.nomor} (${selectedKamar.tipe})`
                      : "Pilih Kamar"}
                  </span>
                  <svg
                    className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isKamarOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>

                <AnimatePresence>
                  {isKamarOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsKamarOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full mt-2 left-0 right-0 z-20 bg-white border border-slate-100 shadow-xl rounded-2xl overflow-hidden py-2 max-h-60 overflow-y-auto custom-scrollbar"
                      >
                        {kamar.length > 0 ? (
                          kamar.map((k) => (
                            <div
                              key={k.id}
                              onClick={() => {
                                setForm({ ...form, id_kamar: k.id.toString() });
                                setIsKamarOpen(false);
                              }}
                              className={`px-4 py-3 cursor-pointer text-sm font-bold transition-colors flex items-center justify-between ${
                                form.id_kamar === k.id.toString()
                                  ? "bg-indigo-50 text-indigo-600"
                                  : "hover:bg-slate-50 text-slate-600"
                              }`}
                            >
                              {/* PAKAI NAMA PROPERTY YANG BENER DI SINI */}
                              <span>
                                Kamar {k.nomor} ({k.tipe}) - Rp{" "}
                                {Number(k.harga).toLocaleString("id-ID")}
                              </span>

                              {form.id_kamar === k.id.toString() && (
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-sm text-slate-400 italic">
                            Tidak ada kamar tersedia
                          </div>
                        )}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Tanggal Masuk */}
              <div className="space-y-1.5">
                <label className={labelStyle}>Tanggal Masuk</label>
                <input
                  name="tanggal_masuk"
                  type="date"
                  value={form.tanggal_masuk}
                  onChange={handleChange}
                  required
                  className={inputStyle}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all"
                >
                  Batal
                </button>
                <motion.button
                  whileHover={hoverClick.whileHover}
                  whileTap={hoverClick.whileTap}
                  type="submit"
                  className={`${editId ? btnAmber : btnPrimary} flex-[2] py-4 rounded-2xl`}
                >
                  {editId ? "Update Penyewa" : "Tambah Penyewa"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PenyewaModal;
