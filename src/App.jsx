import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PendaftaranMandiri from "./pages/pendaftaran_mandiri.jsx";
import PilihDokter from "./pages/pilih_dokter"; // atau path sesuai struktur kamu

import './App.css';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PendaftaranMandiri />} />
        <Route path="/pilih-dokter" element={<PilihDokter />} />
      </Routes>
    </Router>
  );
}

export default App;
