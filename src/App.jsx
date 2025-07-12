import { Routes, Route } from 'react-router-dom';
import ReservaForm from './components/ReservaForm';
import PanelReservas from './components/PanelReservas';

function App() {
  return (
    <Routes>
      <Route path="/" element={<ReservaForm />} />
      <Route path="/admin-4429" element={<PanelReservas />} />
    </Routes>
  );
}

export default App;
