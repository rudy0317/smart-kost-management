import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  modalVariants,
  overlayVariants,
  hoverClick,
} from "../../utils/animations";

import { inputStyle, labelStyle, btnPrimary, btnAmber } from "../../utils/theme";

const KamarModal = ({
  isOpen,
  onClose,
  onSubmit,
  editId,
  form,
  setForm,
  fasilitasList,
  onFasilitasChange,
}) => {
  // State buat ngontrol custom dropdown
  const [isTipeOpen, setIsTipeOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const listFasilitasDefault = [
    "AC",
    "Kipas Angin",
    "KM Dalam",
    "KM Luar",
    "WiFi",
    "Water Heater",
    "Smart TV",
    "Kasur & Lemari",
  ];

  const handleClose = () => {
    setIsTipeOpen(false);
    setIsStatusOpen(false);
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
            className="relative bg-white w-full max-w-lg p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-black text-slate-800">
                  {editId ? "Update Kamar" : "Unit Kamar Baru"}
                </h3>
                <p className="text-sm text-slate-400">
                  Lengkapi detail spesifikasi kamar.
                </p>
              </div>
              <button
                onClick={handleClose}
                className="text-slate-300 hover:text-slate-500 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={labelStyle}>Nomor</label>
                  <input
                    name="nomor"
                    value={form.nomor}
                    onChange={handleChange}
                    required
                    className={inputStyle}
                    placeholder="A-01"
                  />
                </div>

                {/* --- CUSTOM DROPDOWN TIPE KAMAR --- */}
                <div className="space-y-1.5 relative z-30">
                  <label className={labelStyle}>Tipe</label>
                  <div
                    onClick={() => setIsTipeOpen(!isTipeOpen)}
                    className={`${inputStyle} flex items-center justify-between cursor-pointer`}
                  >
                    <span className={form.tipe ? "text-slate-800 font-medium" : "text-slate-400"}>
                      {form.tipe || "Pilih Tipe"}
                    </span>
                    <svg
                      className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isTipeOpen ? "rotate-180" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  <AnimatePresence>
                    {isTipeOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsTipeOpen(false)}></div>
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full mt-2 left-0 right-0 z-20 bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden py-2"
                        >
                          {["Standard", "Premium", "VIP"].map((tipe) => (
                            <div
                              key={tipe}
                              onClick={() => {
                                setForm({ ...form, tipe: tipe });
                                setIsTipeOpen(false);
                              }}
                              className={`px-5 py-3 cursor-pointer text-sm font-bold transition-colors flex items-center justify-between ${
                                form.tipe === tipe
                                  ? "bg-indigo-50/80 text-indigo-600"
                                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                              }`}
                            >
                              {tipe}
                              {form.tipe === tipe && (
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
              </div>

              {/* --- CUSTOM CHECKBOX FASILITAS --- */}
              <div className="space-y-1.5">
                <label className={labelStyle}>Fasilitas</label>
                <div className="grid grid-cols-2 gap-4 p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                  {listFasilitasDefault.map((fas) => {
                    const isChecked = fasilitasList.includes(fas);
                    return (
                      <div
                        key={fas}
                        onClick={() => {
                          const e = { target: { value: fas, checked: !isChecked } };
                          onFasilitasChange(e);
                        }}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        {/* Lingkaran Checkbox Custom */}
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          isChecked
                            ? "bg-indigo-600 border-indigo-600"
                            : "border-slate-300 bg-white group-hover:border-indigo-400"
                        }`}>
                          <AnimatePresence>
                            {isChecked && (
                              <motion.svg
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </motion.svg>
                            )}
                          </AnimatePresence>
                        </div>
                        <span className="text-sm text-slate-600 group-hover:text-indigo-600 transition-colors font-medium">
                          {fas}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={labelStyle}>Harga Sewa (Rp)</label>
                <input
                  name="harga"
                  type="number"
                  value={form.harga}
                  onChange={handleChange}
                  required
                  className={inputStyle}
                  placeholder="1500000"
                />
              </div>

              {/* --- CUSTOM DROPDOWN STATUS KAMAR --- */}
              <div className="space-y-1.5 relative z-20">
                <label className={labelStyle}>Status Kamar</label>
                <div
                  onClick={() => setIsStatusOpen(!isStatusOpen)}
                  className={`${inputStyle} flex items-center justify-between cursor-pointer`}
                >
                  <span className="font-medium text-slate-800">
                    {form.status === "kosong" ? "Kosong (Tersedia)" : "Terisi"}
                  </span>
                  <svg
                    className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isStatusOpen ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                <AnimatePresence>
                  {isStatusOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsStatusOpen(false)}></div>
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full mb-2 left-0 right-0 z-20 bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden py-2"
                      >
                        {[
                          { val: "kosong", label: "Kosong (Tersedia)" },
                          { val: "terisi", label: "Terisi" },
                        ].map((item) => (
                          <div
                            key={item.val}
                            onClick={() => {
                              setForm({ ...form, status: item.val });
                              setIsStatusOpen(false);
                            }}
                            className={`px-5 py-3 cursor-pointer text-sm font-bold transition-colors flex items-center justify-between ${
                              form.status === item.val
                                ? "bg-indigo-50/80 text-indigo-600"
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                            }`}
                          >
                            {item.label}
                            {form.status === item.val && (
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
                  className={`flex-[2] py-4 ${editId ? btnAmber : btnPrimary}`}
                >
                  {editId ? "Update Unit" : "Simpan Unit"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default KamarModal;