import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { FaFileExcel, FaUsers, FaUserPlus, FaClock } from 'react-icons/fa';

const socket = io(import.meta.env.VITE_BACKEND_URL);

export default function PanelReservas() {
  const [reservas, setReservas] = useState([]);

  useEffect(() => {
    obtenerReservas();

    // Comentado: Solicitar permiso para notificaciones push
    // if (Notification.permission !== 'granted') {
    //   Notification.requestPermission();
    // }

    socket.on('nueva-reserva', (nueva) => {
      setReservas((prev) => [nueva, ...prev]);
      toast.info(`Nueva reserva de ${nueva.nombre}`);

      // Comentado: Sonido
      // const audio = new Audio('/sonido.mp3');
      // audio.play();

      // Comentado: Notificación push del navegador
      // if (Notification.permission === 'granted') {
      //   new Notification('Nueva reserva recibida', {
      //     body: `${nueva.nombre} reservó para ${nueva.personas} persona(s).`,
      //     icon: '/icono-notificacion.png',
      //   });
      // }
    });

    return () => socket.off('nueva-reserva');
  }, []);

  const obtenerReservas = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reservas`);
      const data = await res.json();
      setReservas(data);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const exportarExcel = () => {
    const ws = XLSX.utils.json_to_sheet(reservas);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reservas');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'reservas.xlsx');
  };

  const totalPersonas = reservas.reduce((acc, r) => acc + r.personas, 0);
  const ultimaReserva = reservas[0];
  const graficoData = reservas.reduce((acc, r) => {
    const fecha = r.fecha;
    acc[fecha] = (acc[fecha] || 0) + r.personas;
    return acc;
  }, {});
  const dataGrafico = Object.keys(graficoData).map(fecha => ({ fecha, personas: graficoData[fecha] }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 p-6">
      <ToastContainer />
      <header className="mb-8 bg-white shadow-lg rounded-xl p-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-blue-600">📊 Panel de Reservas</h1>
        <button
          onClick={exportarExcel}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl transition duration-200"
        >
          <FaFileExcel />
          Exportar Excel
        </button>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
          <FaUserPlus className="text-blue-500 text-3xl" />
          <div>
            <p className="text-gray-500 font-semibold">Total reservas</p>
            <p className="text-2xl font-bold">{reservas.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
          <FaUsers className="text-green-500 text-3xl" />
          <div>
            <p className="text-gray-500 font-semibold">Personas totales</p>
            <p className="text-2xl font-bold">{totalPersonas}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
          <FaClock className="text-orange-500 text-3xl" />
          <div>
            <p className="text-gray-500 font-semibold">Última reserva</p>
            <p className="text-lg font-medium">{ultimaReserva?.nombre} - {ultimaReserva?.fecha}</p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow p-6 mb-10">
        <h3 className="text-xl font-semibold mb-4 text-blue-600">📈 Personas por Fecha</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dataGrafico}>
            <XAxis dataKey="fecha" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="personas" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section className="bg-white rounded-xl shadow p-6">
        <h3 className="text-xl font-semibold mb-4 text-blue-600">📝 Lista de Reservas</h3>
        <ul className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {reservas.map((r) => (
            <li key={r._id} className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg shadow-sm">
              <p className="text-lg font-semibold">{r.nombre} <span className="text-sm text-gray-600">({r.email})</span></p>
              <p>📅 <strong>{r.fecha}</strong> – 👥 {r.personas} persona(s)</p>
              <p className="italic text-gray-700">{r.mensaje}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
