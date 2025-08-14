import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PendaftaranMandiri from "./pages/pendaftaran_mandiri.jsx";
import PilihDokter from "./pages/pilih_dokter";
import KonfirmasiPendaftaran from './pages/konfirmasi_pendaftaran';
import Antrian from "./pages/antrian";
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PendaftaranMandiri />} />
        <Route path="/pilih-dokter" element={<PilihDokter />} />
        <Route path="/konfirmasi-pendaftaran" element={<KonfirmasiPendaftaran />} />
        <Route path="/antrian" element={<Antrian />} />
      </Routes>
    </Router>
  );
}

export default App;
