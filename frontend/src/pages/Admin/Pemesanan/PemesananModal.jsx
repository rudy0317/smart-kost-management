import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  modalVariants,
  overlayVariants,
  hoverClick,
} from "../../../utils/animations";
import { inputStyle, labelStyle, btnPrimary } from "../../../utils/theme";

const PemesananModal = ({
  isOpen,
  onClose,
  onSubmit,
  form,
  setForm,
  kosongKamar,
  onChange,
}) => {
  const [isKamarOpen, setIsKamarOpen] = useState(false);

  const handleKamarSelect = (id) => {
    setForm({ ...form, id_kamar: id });
    setIsKamarOpen(false);
  };

  const selectedKamar = kosongKamar.find((k) => k.id === form.id_kamar);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
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
                  Pemesanan Baru
                </h3>
                <p className="text-sm text-slate-400">
                  Tambah pemesanan manual oleh admin.
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-slate-300 hover:text-slate-500 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
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
              <div className="space-y-1.5">
                <label className={labelStyle}>Nama Lengkap</label>
                <input
                  name="nama"
                  value={form.nama}
                  onChange={onChange}
                  required
                  className={inputStyle}
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-1.5">
                <label className={labelStyle}>No. HP / WhatsApp</label>
                <input
                  name="no_hp"
                  type="tel"
                  value={form.no_hp}
                  onChange={onChange}
                  required
                  className={inputStyle}
                  placeholder="081234567890"
                />
              </div>

              <div className="space-y-1.5">
                <label className={labelStyle}>Pilih Kamar Kosong</label>
                <div className="relative">
                  <div
                    className={`${inputStyle} cursor-pointer flex items-center justify-between pr-10`}
                    onClick={() => setIsKamarOpen(!isKamarOpen)}
                  >
                    {selectedKamar ? (
                      <>
                        {selectedKamar.nomor} ({selectedKamar.tipe}) - Rp{" "}
                        {Number(selectedKamar.harga).toLocaleString("id-ID")}
                      </>
                    ) : (
                      "Pilih Kamar Tersedia"
                    )}
                    <svg
                      className={`w-5 h-5 transition-transform ${isKamarOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
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
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 z-10"
                          onClick={() => setIsKamarOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute z-20 w-full bg-white rounded-2xl shadow-xl border border-slate-100 mt-2 py-2 max-h-60 overflow-auto custom-scrollbar"
                        >
                          {kosongKamar.map((k) => (
                            <div
                              key={k.id}
                              className="px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors text-sm"
                              onClick={() => handleKamarSelect(k.id)}
                            >
                              {k.nomor} ({k.tipe}) - Rp{" "}
                              {Number(k.harga).toLocaleString("id-ID")}
                            </div>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
                <input type="hidden" name="id_kamar" value={form.id_kamar} />
              </div>

              <div className="space-y-1.5">
                <label className={labelStyle}>Tanggal Masuk</label>
                <input
                  name="tanggal_masuk"
                  type="date"
                  value={form.tanggal_masuk}
                  onChange={onChange}
                  required
                  className={inputStyle}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all"
                >
                  Batal
                </button>
                <motion.button
                  whileHover={hoverClick.whileHover}
                  whileTap={hoverClick.whileTap}
                  type="submit"
                  className={`${btnPrimary} flex-[2] py-4 shadow-lg shadow-indigo-200`}
                >
                  Tambah Pemesanan
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PemesananModal;
