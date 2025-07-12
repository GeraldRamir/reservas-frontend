// src/components/CalendarioReservas.jsx
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import '@fullcalendar/common/main.css';
import '@fullcalendar/daygrid/main.css';

export default function CalendarioReservas({ reservas }) {
  const eventos = reservas.map((r) => ({
    title: `${r.nombre} (${r.personas})`,
    date: r.fecha,
  }));

  return (
    <div className="bg-white p-4 shadow rounded-xl mb-8">
      <h3 className="mb-4 font-semibold text-lg">📆 Calendario de Reservas</h3>
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={eventos}
        height="auto"
      />
    </div>
  );
}
