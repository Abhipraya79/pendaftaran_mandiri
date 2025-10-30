import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PendaftaranMandiri from "./pages/pendaftaran_mandiri.jsx";
import PilihDokter from "./pages/pilih_dokter";
import KonfirmasiPendaftaran from './pages/konfirmasi_pendaftaran';
import Antrian from "./pages/antrian";
import PasienList from "./pages/PasienList.jsx"
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PendaftaranMandiri />} />
        <Route path="/pilih-dokter" element={<PilihDokter />} />
        <Route path="/konfirmasi-pendaftaran" element={<KonfirmasiPendaftaran />} />
        <Route path="/antrian" element={<Antrian />} />
        <Route path="/PasienList" element={<PasienList />} />
      </Routes>
    </Router>
  );
}

export default App;
