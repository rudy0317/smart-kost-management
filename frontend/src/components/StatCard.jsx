function StatCard({ title, value, textColor = "text-gray-900" }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center transition-all hover:shadow-md hover:-translate-y-0.5">
      <p className="text-sm font-semibold text-gray-500 mb-1">{title}</p>
      {/* Warna teks dinamis, defaultnya abu-abu gelap */}
      <h2 className={`text-3xl font-bold truncate ${textColor}`}>
        {value}
      </h2>
    </div>
  )
}

export default StatCard