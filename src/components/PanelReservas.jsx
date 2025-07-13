import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const socket = io(import.meta.env.VITE_BACKEND_URL);

export default function PanelReservas() {
  const [reservas, setReservas] = useState([]);
  const [clave, setClave] = useState('');
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    const acceso = localStorage.getItem('accesoAdmin');
    if (acceso === 'true') setAutorizado(true);
  }, []);

  useEffect(() => {
    if (!autorizado) return;
    obtenerReservas();
    socket.on('nueva-reserva', (nueva) => {
      setReservas((prev) => [nueva, ...prev]);
      toast.info(`Nueva reserva de ${nueva.nombre}`);
    });
    return () => socket.off('nueva-reserva');
  }, [autorizado]);

  const verificarClave = (e) => {
    e.preventDefault();
    if (clave === '1234admin') {
      localStorage.setItem('accesoAdmin', 'true');
      setAutorizado(true);
    } else {
      toast.error('Clave incorrecta');
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem('accesoAdmin');
    setAutorizado(false);
    setClave('');
  };

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

  const eliminarReserva = async (id) => {
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reservas/${id}`, {
        method: 'DELETE',
      });
      setReservas((prev) => prev.filter((r) => r._id !== id));
      toast.success('Reserva eliminada');
    } catch (err) {
      toast.error('Error al eliminar');
    }
  };

  const totalPersonas = reservas.reduce((acc, r) => acc + r.personas, 0);
  const ultimaReserva = reservas[0];
  const graficoData = reservas.reduce((acc, r) => {
    const fecha = r.fecha;
    acc[fecha] = (acc[fecha] || 0) + r.personas;
    return acc;
  }, {});
  const dataGrafico = Object.keys(graficoData).map(fecha => ({ fecha, personas: graficoData[fecha] }));

  if (!autorizado) {
    return (
      <div className="container d-flex align-items-center justify-content-center min-vh-100 bg-light">
        <div className="card shadow p-4 w-100" style={{ maxWidth: '400px' }}>
          <h4 className="text-center mb-4">🔐 Acceso Admin</h4>
          <form onSubmit={verificarClave}>
            <input
              type="password"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              placeholder="Ingrese clave"
              className="form-control mb-3"
            />
            <button type="submit" className="btn btn-primary w-100">Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-body-tertiary min-vh-100">
      <ToastContainer />
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary px-4">
        <div className="container-fluid">
          <span className="navbar-brand">📊 Panel de Reservas</span>
          <div className="d-flex gap-2">
            <button onClick={exportarExcel} className="btn btn-success">Exportar Excel</button>
            <button onClick={cerrarSesion} className="btn btn-danger">Cerrar sesión</button>
          </div>
        </div>
      </nav>

      <div className="container py-4">
        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div className="card text-bg-light shadow">
              <div className="card-body">
                <h5 className="card-title">Total Reservas</h5>
                <p className="display-6 fw-bold">{reservas.length}</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-bg-light shadow">
              <div className="card-body">
                <h5 className="card-title">Personas Totales</h5>
                <p className="display-6 fw-bold">{totalPersonas}</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-bg-light shadow">
              <div className="card-body">
                <h5 className="card-title">Última Reserva</h5>
                <p className="fw-bold mb-0">{ultimaReserva?.nombre}</p>
                <small className="text-muted">{ultimaReserva?.fecha}</small>
              </div>
            </div>
          </div>
        </div>

        <div className="card mb-5 shadow">
          <div className="card-header bg-primary text-white">📈 Personas por Fecha</div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dataGrafico}>
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="personas" fill="#0d6efd" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card shadow border-0">
          <div className="card-header bg-primary text-white">📝 Lista de Reservas</div>
          <div className="p-4">
            <div className="row g-4">
              {reservas.map((r, index) => (
                <div key={r._id} className="col-md-6">
                  <div className={`p-4 rounded shadow-sm text-dark border-start border-5 
                    ${index % 4 === 0 ? 'bg-danger-subtle border-danger' :
                      index % 4 === 1 ? 'bg-warning-subtle border-warning' :
                      index % 4 === 2 ? 'bg-success-subtle border-success' :
                      'bg-info-subtle border-info'}`}>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h5 className="fw-bold mb-1">{r.nombre}</h5>
                        <small className="text-muted">{r.email}</small>
                      </div>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => eliminarReserva(r._id)}>
                        Eliminar
                      </button>
                    </div>
                    <p className="mb-1">📅 <strong>{r.fecha}</strong></p>
                    <p className="mb-1">👥 {r.personas} persona(s)</p>
                    <p className="fst-italic text-muted">{r.mensaje || 'Sin mensaje adicional'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
