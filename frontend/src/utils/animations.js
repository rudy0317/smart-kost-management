// src/utils/animations.js
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" },
  // Tambahkan ini kalau mau aktif pas di-scroll
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true }
};

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 30 }, // Mulai dari agak bawah
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", damping: 20, stiffness: 300 }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20, // Turun sedikit pas ilang
    transition: { duration: 0.2 }
  },
};

export const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const hoverClick = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
};


