import { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../style.css'

export default function ReservaForm() {
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    fecha: '',
    personas: 1,
    mensaje: '',
  });

  const [tickets, setTickets] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reservas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('Error al enviar reserva');

      const nueva = await res.json();
      setTickets((prev) => [nueva, ...prev]);

      setShowModal(true);
      setTimeout(() => setShowModal(false), 2000);

      setForm({ nombre: '', email: '', fecha: '', personas: 1, mensaje: '' });
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="container my-5">
      {/* Modal de confirmación */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Body className="text-center text-success fw-bold">
          ✅ ¡Reserva enviada con éxito!
          <div className="text-muted small">Revisa tu ticket generado al lado.</div>
        </Modal.Body>
      </Modal>

      <div className="row g-4">
        {/* Formulario */}
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Formulario de Reserva</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit} className="needs-validation">
                <div className="mb-3">
                  <label className="form-label">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    className="form-control"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Correo electrónico</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Fecha de reserva</label>
                  <input
                    type="date"
                    name="fecha"
                    className="form-control"
                    value={form.fecha}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Número de personas</label>
                  <input
                    type="number"
                    name="personas"
                    className="form-control"
                    min="1"
                    value={form.personas}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Mensaje adicional</label>
                  <textarea
                    name="mensaje"
                    className="form-control"
                    rows="3"
                    value={form.mensaje}
                    onChange={handleChange}
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-success w-100">
                  Enviar Reserva
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Tickets generados */}
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-header bg-secondary text-white">
              <h5 className="mb-0">🎟️ Tickets Generados</h5>
            </div>
<div className="card-body" style={{ maxHeight: '500px', overflowY: 'auto' }}>
  {tickets.length === 0 ? (
    <p className="text-muted">Aún no hay tickets generados.</p>
  ) : (
    <div className="d-flex flex-column gap-3">
      {tickets.map((t, index) => (
        <div key={index} className="ticket-receipt shadow-sm">
          <div className="ticket-header">
            <h6 className="mb-1 text-uppercase">Reserva Confirmada</h6>
          </div>
          <div className="ticket-body">
            <p><strong>🎟 Nombre:</strong> {t.nombre}</p>
            <p><strong>📧 Email:</strong> {t.email}</p>
            <p><strong>📅 Fecha:</strong> {t.fecha}</p>
            <p><strong>👥 Personas:</strong> {t.personas}</p>
            <p><strong>📝 Mensaje:</strong> {t.mensaje || 'Sin mensaje adicional.'}</p>
          </div>
          <div className="ticket-footer">
            <small className="text-muted">Gracias por reservar con nosotros</small>
          </div>
        </div>
      ))}
    </div>
  )}
</div>

          </div>
        </div>
      </div>
    </div>
  );
}
