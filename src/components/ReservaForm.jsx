import { useState } from 'react';

export default function ReservaForm() {
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    fecha: '',
    personas: 1,
    mensaje: '',
  });

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

      alert('Reserva enviada con éxito');
      setForm({ nombre: '', email: '', fecha: '', personas: 1, mensaje: '' });
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="nombre"
        placeholder="Nombre"
        value={form.nombre}
        onChange={handleChange}
        required
      />
      <input
        name="email"
        type="email"
        placeholder="Correo electrónico"
        value={form.email}
        onChange={handleChange}
        required
      />
      <input
        name="fecha"
        type="date"
        value={form.fecha}
        onChange={handleChange}
        required
      />
      <input
        name="personas"
        type="number"
        min="1"
        value={form.personas}
        onChange={handleChange}
        required
      />
      <textarea
        name="mensaje"
        placeholder="Mensaje adicional"
        value={form.mensaje}
        onChange={handleChange}
      />
      <button type="submit">Enviar Reserva</button>
    </form>
  );
}
