// Proyecto completo con todas las mejoras aplicadas comenzando por el dashboard
// Este archivo será el nuevo PanelReservas.jsx

import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const socket = io('http://localhost:3001');

export default function PanelReservas() {
  const [clave, setClave] = useState('');
  const [autorizado, setAutorizado] = useState(false);
  const [reservas, setReservas] = useState([]);

  useEffect(() => {
    const acceso = localStorage.getItem('accesoAdmin');
    if (acceso === 'true') setAutorizado(true);
  }, []);

useEffect(() => {
  if (autorizado) {
    obtenerReservas();

    // ✅ Solicita permiso una sola vez
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }

    socket.on('nueva-reserva', (nueva) => {
      setReservas((prev) => [nueva, ...prev]);
      toast.info(`Nueva reserva de ${nueva.nombre}`);
      const audio = new Audio('/sonido.mp3');
      audio.play();

      // ✅ Enviar notificación del navegador
      if (Notification.permission === 'granted') {
        new Notification('Nueva reserva recibida', {
          body: `${nueva.nombre} reservó para ${nueva.personas} persona(s).`,
          icon: '/icono-notificacion.png',
        });
      }
    });
  }

  return () => socket.off('nueva-reserva');
}, [autorizado]);


  const obtenerReservas = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/reservas');
      const data = await res.json();
      setReservas(data);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const verificarClave = (e) => {
    e.preventDefault();
    if (clave === '1234admin') {
      localStorage.setItem('accesoAdmin', 'true');
      setAutorizado(true);
    } else {
      alert('Clave incorrecta');
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem('accesoAdmin');
    setAutorizado(false);
    setClave('');
  };

  const exportarExcel = () => {
    const ws = XLSX.utils.json_to_sheet(reservas);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reservas');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'reservas.xlsx');
  };

  if (!autorizado) {
    return (
      <div className="flex h-screen justify-center items-center bg-gray-100">
        <form onSubmit={verificarClave} className="bg-white p-8 rounded-xl shadow-md space-y-4">
          <h2 className="text-xl font-bold text-center">🔐 Ingreso Admin</h2>
          <input
            type="password"
            placeholder="Clave"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full">Entrar</button>
        </form>
      </div>
    );
  }

  const totalPersonas = reservas.reduce((acc, r) => acc + r.personas, 0);
  const ultimaReserva = reservas[0];
  const graficoData = reservas.reduce((acc, r) => {
    const fecha = r.fecha;
    acc[fecha] = (acc[fecha] || 0) + r.personas;
    return acc;
  }, {});

  const dataGrafico = Object.keys(graficoData).map(fecha => ({ fecha, personas: graficoData[fecha] }));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ToastContainer />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">📊 Panel de Reservas</h2>
        <button onClick={cerrarSesion} className="bg-red-500 text-white px-4 py-2 rounded">Cerrar sesión</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white shadow p-4 rounded-xl">
          <h3 className="font-semibold">Total reservas</h3>
          <p className="text-2xl">{reservas.length}</p>
        </div>
        <div className="bg-white shadow p-4 rounded-xl">
          <h3 className="font-semibold">Personas totales</h3>
          <p className="text-2xl">{totalPersonas}</p>
        </div>
        <div className="bg-white shadow p-4 rounded-xl">
          <h3 className="font-semibold">Última reserva</h3>
          <p>{ultimaReserva?.nombre} - {ultimaReserva?.fecha}</p>
        </div>
      </div>

      <div className="bg-white p-4 shadow rounded-xl mb-8">
        <h3 className="mb-4 font-semibold">Gráfico de Personas por Fecha</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dataGrafico}>
            <XAxis dataKey="fecha" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="personas" fill="#60a5fa" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold">📝 Lista de Reservas</h3>
        <button onClick={exportarExcel} className="bg-green-600 text-white px-4 py-2 rounded">Exportar Excel</button>
      </div>
      <ul className="space-y-3">
        {reservas.map((r) => (
          <li key={r._id} className="bg-white p-4 shadow rounded-xl">
            <p><strong>{r.nombre}</strong> ({r.email})</p>
            <p>Fecha: {r.fecha} - Personas: {r.personas}</p>
            <p className="italic">{r.mensaje}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
