import { useState, useEffect } from 'react'
import api from '../../api'
import Sidebar from "../../components/Sidebar"
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeInUp } from "../../utils/animations"
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

function Laporan() {
  const bulanOptions = [
    { nama: 'Januari', val: '01' }, { nama: 'Februari', val: '02' },
    { nama: 'Maret', val: '03' }, { nama: 'April', val: '04' },
    { nama: 'Mei', val: '05' }, { nama: 'Juni', val: '06' },
    { nama: 'Juli', val: '07' }, { nama: 'Agustus', val: '08' },
    { nama: 'September', val: '09' }, { nama: 'Oktober', val: '10' },
    { nama: 'November', val: '11' }, { nama: 'Desember', val: '12' }
  ]

  const [bulanPilih, setBulanPilih] = useState('04')
  const [tahunPilih, setTahunPilih] = useState(new Date().getFullYear().toString())
  const [tahunList, setTahunList] = useState([])
  const [data, setData] = useState(null)
  const [isBulanOpen, setIsBulanOpen] = useState(false)
  const [isTahunOpen, setIsTahunOpen] = useState(false)

  const fetchTahun = async () => {
    try {
      const res = await api.get('/api/laporan/list-tahun')
      setTahunList(res.data)
    } catch {
      setTahunList([new Date().getFullYear().toString()])
    }
  }

  const fetchLaporan = async () => {
    try {
      const res = await api.get(`/api/laporan?bulan=${tahunPilih}-${bulanPilih}`)
      setData(res.data)
    } catch {
      toast.error("Gagal memuat laporan keuangan.")
    }
  }

  useEffect(() => { fetchTahun() }, [])
  useEffect(() => { fetchLaporan() }, [bulanPilih, tahunPilih])

  const getNamaBulan = (val) => bulanOptions.find(b => b.val === val)?.nama

  const statusColor = (status) => {
    if (status === 'lunas') return 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200'
    if (status === 'terlambat') return 'bg-red-100 text-red-700 ring-1 ring-red-200'
    return 'bg-amber-100 text-amber-700 ring-1 ring-amber-200'
  }

  const saldo = data ? Number(data.total_pemasukan) - Number(data.total_pengeluaran) : 0
  const totalTransaksi = data ? Number(data.total_pemasukan || 0) + Number(data.total_pengeluaran || 0) : 0
  const persenPemasukan = totalTransaksi === 0 ? 50 : (Number(data.total_pemasukan || 0) / totalTransaksi) * 100
  const persenPengeluaran = totalTransaksi === 0 ? 50 : (Number(data.total_pengeluaran || 0) / totalTransaksi) * 100

  const exportPDF = () => {
    if (!data || !data.detail || data.detail.length === 0) {
      toast.error("Tidak ada data untuk dicetak.")
      return
    }
    const doc = new jsPDF()
    const namaBulan = getNamaBulan(bulanPilih)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('Laporan Keuangan Kost', 14, 20)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`Periode: ${namaBulan} ${tahunPilih}`, 14, 28)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Ringkasan Keuangan', 14, 42)
    autoTable(doc, {
      startY: 46,
      head: [['Keterangan', 'Jumlah']],
      body: [
        ['Total Pemasukan', `Rp ${Number(data.total_pemasukan).toLocaleString('id-ID')}`],
        ['Total Pengeluaran', `Rp ${Number(data.total_pengeluaran).toLocaleString('id-ID')}`],
        ['Saldo Bersih', `Rp ${Number(saldo).toLocaleString('id-ID')}`],
        ['Penyewa Sudah Bayar', `${data.sudah_bayar} orang`],
        ['Penyewa Belum Bayar', `${data.belum_bayar} orang`],
      ],
      styles: { fontSize: 10 },
      headStyles: { fillColor: [79, 70, 229] },
      columnStyles: { 1: { halign: 'right' } }
    })
    doc.setFont('helvetica', 'bold')
    doc.text('Detail Transaksi', 14, doc.lastAutoTable.finalY + 14)
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 18,
      head: [['Penyewa', 'Kamar', 'Jumlah', 'Tgl Bayar', 'Status']],
      body: data.detail.map(item => [
        item.nama_penyewa,
        `Kamar ${item.nomor_kamar}`,
        `Rp ${Number(item.jumlah).toLocaleString('id-ID')}`,
        item.tanggal_bayar ? item.tanggal_bayar.slice(0, 10) : '-',
        item.status.charAt(0).toUpperCase() + item.status.slice(1)
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [79, 70, 229] },
      columnStyles: { 2: { halign: 'right' } }
    })
    doc.save(`Laporan_Kost_${namaBulan}_${tahunPilih}.pdf`)
    toast.success("PDF berhasil diunduh!")
  }

  const exportCSV = () => {
    if (!data || !data.detail || data.detail.length === 0) {
      toast.error("Tidak ada data untuk diekspor.")
      return
    }
    const headers = ["Nama Penyewa", "Nomor Kamar", "Jumlah", "Tanggal Bayar", "Status"]
    const rows = data.detail.map(item => [
      item.nama_penyewa,
      item.nomor_kamar,
      item.jumlah,
      item.tanggal_bayar ? item.tanggal_bayar.slice(0, 10) : '-',
      item.status
    ])
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `Laporan_Kost_${getNamaBulan(bulanPilih)}_${tahunPilih}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("CSV berhasil diunduh!")
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />
      <motion.main
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="flex-1 p-10 overflow-y-auto"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">Laporan Keuangan</h1>
            <p className="text-slate-500 mt-1">Pantau pemasukan, pengeluaran, dan status pembayaran.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">

            {/* Custom Dropdown Bulan & Tahun */}
            <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm">

              {/* Dropdown Bulan */}
              <div className="relative">
                <button
                  onClick={() => { setIsBulanOpen(!isBulanOpen); setIsTahunOpen(false) }}
                  className="flex items-center gap-1.5 font-medium text-slate-700 text-sm"
                >
                  {getNamaBulan(bulanPilih)}
                  <svg className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isBulanOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <AnimatePresence>
                  {isBulanOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsBulanOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full mt-2 left-0 z-20 bg-white border border-slate-100 shadow-xl rounded-2xl overflow-hidden py-2 w-36"
                      >
                        {bulanOptions.map(b => (
                          <div
                            key={b.val}
                            onClick={() => { setBulanPilih(b.val); setIsBulanOpen(false) }}
                            className={`px-4 py-2.5 cursor-pointer text-sm transition-colors ${
                              bulanPilih === b.val
                                ? 'bg-indigo-50 text-indigo-600 font-bold'
                                : 'hover:bg-slate-50 text-slate-600 font-medium'
                            }`}
                          >
                            {b.nama}
                          </div>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <span className="text-slate-300 font-medium">/</span>

              {/* Dropdown Tahun */}
              <div className="relative">
                <button
                  onClick={() => { setIsTahunOpen(!isTahunOpen); setIsBulanOpen(false) }}
                  className="flex items-center gap-1.5 font-medium text-slate-700 text-sm"
                >
                  {tahunPilih}
                  <svg className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isTahunOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <AnimatePresence>
                  {isTahunOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsTahunOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full mt-2 left-0 z-20 bg-white border border-slate-100 shadow-xl rounded-2xl overflow-hidden py-2 w-24"
                      >
                        {tahunList.map(t => (
                          <div
                            key={t}
                            onClick={() => { setTahunPilih(t); setIsTahunOpen(false) }}
                            className={`px-4 py-2.5 cursor-pointer text-sm transition-colors ${
                              tahunPilih === t
                                ? 'bg-indigo-50 text-indigo-600 font-bold'
                                : 'hover:bg-slate-50 text-slate-600 font-medium'
                            }`}
                          >
                            {t}
                          </div>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Tombol Export CSV */}
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-sm transition-all text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </motion.button>

            {/* Tombol Cetak PDF */}
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={exportPDF}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-sm transition-all text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Cetak PDF
            </motion.button>
          </div>
        </div>

        {data && (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1">Pemasukan</p>
                <h2 className="text-xl font-black text-emerald-900">Rp {Number(data.total_pemasukan).toLocaleString('id-ID')}</h2>
              </div>
              <div className="bg-red-50 p-5 rounded-2xl border border-red-100">
                <p className="text-xs font-black text-red-600 uppercase tracking-widest mb-1">Pengeluaran</p>
                <h2 className="text-xl font-black text-red-900">Rp {Number(data.total_pengeluaran).toLocaleString('id-ID')}</h2>
              </div>
              <div className={`p-5 rounded-2xl border ${saldo >= 0 ? 'bg-indigo-50 border-indigo-100' : 'bg-red-50 border-red-100'}`}>
                <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-1">Saldo Bersih</p>
                <h2 className={`text-xl font-black ${saldo >= 0 ? 'text-indigo-900' : 'text-red-900'}`}>
                  Rp {Number(saldo).toLocaleString('id-ID')}
                </h2>
              </div>
              <div className="bg-slate-100 p-5 rounded-2xl border border-slate-200">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Sudah Bayar</p>
                <h2 className="text-xl font-black text-slate-800">{data.sudah_bayar} <span className="text-sm font-medium">orang</span></h2>
              </div>
              <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100">
                <p className="text-xs font-black text-amber-600 uppercase tracking-widest mb-1">Belum Bayar</p>
                <h2 className="text-xl font-black text-amber-900">{data.belum_bayar} <span className="text-sm font-medium">orang</span></h2>
              </div>
            </div>

            {/* Visualisasi Arus Kas */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 mb-8">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Visualisasi Arus Kas</p>
              {totalTransaksi === 0 ? (
                <div className="flex items-center justify-center h-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-400">Belum ada transaksi bulan ini.</p>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-emerald-600">Pemasukan ({persenPemasukan.toFixed(1)}%)</span>
                    <span className="text-red-600">Pengeluaran ({persenPengeluaran.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full h-5 flex rounded-full overflow-hidden bg-slate-100">
                    <div className="bg-emerald-500 transition-all duration-1000" style={{ width: `${persenPemasukan}%` }} />
                    <div className="bg-red-500 transition-all duration-1000" style={{ width: `${persenPengeluaran}%` }} />
                  </div>
                </div>
              )}
            </div>

            {/* Tabel Detail */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
              <div className="p-8 border-b border-slate-100">
                <h3 className="text-lg font-black text-slate-800">
                  Detail Transaksi — {getNamaBulan(bulanPilih)} {tahunPilih}
                </h3>
              </div>
              {data.detail.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-white/90 backdrop-blur-md">
                      <tr className="border-b border-slate-100">
                        <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Penyewa</th>
                        <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Kamar</th>
                        <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Jumlah</th>
                        <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Tgl Bayar</th>
                        <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {data.detail.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-6 font-bold text-slate-800">{item.nama_penyewa}</td>
                          <td className="p-6">
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold border border-indigo-100">
                              Kamar {item.nomor_kamar}
                            </span>
                          </td>
                          <td className="p-6 font-bold text-slate-800">
                            Rp {Number(item.jumlah).toLocaleString('id-ID')}
                          </td>
                          <td className="p-6 text-sm text-slate-600">
                            {item.tanggal_bayar
                              ? new Date(item.tanggal_bayar).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                              : '-'}
                          </td>
                          <td className="p-6">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${statusColor(item.status)}`}>
                              <span className={`w-1.5 h-1.5 rounded-full mr-2 ${item.status === 'lunas' ? 'bg-emerald-500' : item.status === 'terlambat' ? 'bg-red-500' : 'bg-amber-500'}`} />
                              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-16 text-center">
                  <p className="text-slate-400 font-medium">Tidak ada data untuk {getNamaBulan(bulanPilih)} {tahunPilih}.</p>
                </div>
              )}
            </div>
          </>
        )}
      </motion.main>
    </div>
  )
}

export default Laporan