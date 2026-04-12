import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  modalVariants,
  overlayVariants,
  hoverClick,
} from "../../../utils/animations";
import {
  inputStyle,
  labelStyle,
  btnPrimary,
  btnAmber,
} from "../../../utils/theme";

const PembayaranModal = ({
  isOpen,
  onClose,
  onSubmit,
  editId,
  form,
  setForm,
  penyewa,
}) => {
  const [isPenyewaOpen, setIsPenyewaOpen] = useState(false);
  const [isKategoriOpen, setIsKategoriOpen] = useState(false);
  const [isMetodeOpen, setIsMetodeOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleClose = () => {
    setIsPenyewaOpen(false);
    setIsKategoriOpen(false);
    setIsMetodeOpen(false);
    setIsStatusOpen(false);
    onClose();
  };

  const kategoriOptions = ["Sewa Kamar", "Listrik", "Deposit", "Lainnya"];
  const metodeOptions = ["Tunai/Cash", "Transfer", "QRIS"];
  const statusOptions = ["lunas", "dp", "terlambat"];

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
            className="relative bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 max-w-lg w-full max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-800">
                  {editId ? "Edit Pembayaran" : "Catat Pembayaran Baru"}
                </h2>
                <button
                  onClick={handleClose}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={onSubmit} className="space-y-6">
                {/* 1. PILIH PENYEWA */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 relative z-50">
                    <label className={labelStyle}>Nama Penyewa / Kamar</label>
                    <button
                      type="button"
                      onClick={() => setIsPenyewaOpen(!isPenyewaOpen)}
                      className={`${inputStyle} w-full text-left flex justify-between items-center`}
                    >
                      <span className="truncate">
                        {form.id_penyewa 
                          ? (() => {
                              const p = penyewa.find(x => x.id == form.id_penyewa);
                              return p ? `${p.nama} (Kamar ${p.nomor_kamar})` : "Pilih Penyewa...";
                            })()
                          : "Pilih Penyewa..."}
                      </span>
                      <span className="text-[10px] opacity-60 ml-2 shrink-0">▼</span>
                    </button>
                    <AnimatePresence>
                      {isPenyewaOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full mt-2 left-0 right-0 z-[60] bg-white border border-slate-100 shadow-xl rounded-2xl p-3 flex flex-col gap-1.5 max-h-60 overflow-y-auto custom-scrollbar"
                        >
                          {penyewa.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setForm({ ...form, id_penyewa: p.id });
                                setIsPenyewaOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all ${
                                form.id_penyewa == p.id ? "bg-indigo-50 text-indigo-600 font-bold" : "hover:bg-slate-50 text-slate-700"
                              }`}
                            >
                              {p.nama} <span className="text-slate-400 font-normal ml-1">(Kamar {p.nomor_kamar})</span>
                            </button>
                          ))}
                          {penyewa.length === 0 && (
                            <div className="px-4 py-3 text-sm text-slate-400 text-center">Belum ada penyewa aktif.</div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 2. KATEGORI */}
                  <div className="relative">
                    <label className={labelStyle}>Kategori</label>
                    <button
                      type="button"
                      onClick={() => setIsKategoriOpen(!isKategoriOpen)}
                      className={`${inputStyle} w-full text-left flex justify-between items-center`}
                    >
                      {form.kategori || "Pilih..."}
                      <span className="text-[10px] opacity-60">▼</span>
                    </button>
                    <AnimatePresence>
                      {isKategoriOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full mt-2 left-0 right-0 z-50 bg-white border border-slate-100 shadow-xl rounded-2xl p-2 flex flex-col gap-1"
                        >
                          {kategoriOptions.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setForm({ ...form, kategori: opt });
                                setIsKategoriOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-xl text-sm ${
                                form.kategori === opt ? "bg-indigo-50 text-indigo-600 font-bold" : "hover:bg-slate-50"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 3. METODE BAYAR */}
                  <div className="relative">
                    <label className={labelStyle}>Metode Bayar</label>
                    <button
                      type="button"
                      onClick={() => setIsMetodeOpen(!isMetodeOpen)}
                      className={`${inputStyle} w-full text-left flex justify-between items-center`}
                    >
                      {form.metode_bayar || "Pilih..."}
                      <span className="text-[10px] opacity-60">▼</span>
                    </button>
                    <AnimatePresence>
                      {isMetodeOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full mt-2 left-0 right-0 z-50 bg-white border border-slate-100 shadow-xl rounded-2xl p-2 flex flex-col gap-1"
                        >
                          {metodeOptions.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setForm({ ...form, metode_bayar: opt });
                                setIsMetodeOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-xl text-sm ${
                                form.metode_bayar === opt ? "bg-indigo-50 text-indigo-600 font-bold" : "hover:bg-slate-50"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 4. BULAN TAGIHAN */}
                  <div>
                    <label className={labelStyle}>Bulan Tagihan</label>
                    <input
                      type="month"
                      name="bulan"
                      value={form.bulan}
                      onChange={handleChange}
                      required
                      className={inputStyle}
                    />
                  </div>

                  {/* 5. TANGGAL BAYAR */}
                  <div>
                    <label className={labelStyle}>Tanggal Bayar</label>
                    <input
                      type="date"
                      name="tanggal_bayar"
                      value={form.tanggal_bayar}
                      onChange={handleChange}
                      required
                      className={inputStyle}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 6. NOMINAL */}
                  <div>
                    <label className={labelStyle}>Jumlah Bayar (Rp)</label>
                    <input
                      type="number"
                      name="jumlah"
                      value={form.jumlah}
                      onChange={handleChange}
                      placeholder="Contoh: 1500000"
                      required
                      className={inputStyle}
                    />
                  </div>

                  {/* 7. STATUS */}
                  <div className="relative">
                    <label className={labelStyle}>Status</label>
                    <button
                      type="button"
                      onClick={() => setIsStatusOpen(!isStatusOpen)}
                      className={`${inputStyle} w-full text-left flex justify-between items-center`}
                    >
                      <span className="capitalize">{form.status || "Pilih..."}</span>
                      <span className="text-[10px] opacity-60">▼</span>
                    </button>
                    <AnimatePresence>
                      {isStatusOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full mt-2 left-0 right-0 z-50 bg-white border border-slate-100 shadow-xl rounded-2xl p-2 flex flex-col gap-1"
                        >
                          {statusOptions.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setForm({ ...form, status: opt });
                                setIsStatusOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-xl text-sm capitalize ${
                                form.status === opt ? "bg-indigo-50 text-indigo-600 font-bold" : "hover:bg-slate-50"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <motion.button
                    variants={hoverClick}
                    type="submit"
                    className={`${btnPrimary} flex-1 py-4 text-sm font-bold shadow-lg shadow-indigo-200`}
                  >
                    {editId ? "Simpan Perubahan" : "Konfirmasi Pembayaran"}
                  </motion.button>
                  <motion.button
                    variants={hoverClick}
                    type="button"
                    onClick={handleClose}
                    className="flex-1 py-4 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
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

export default PembayaranModal;