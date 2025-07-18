import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PendaftaranMandiri from "./pages/pendaftaran_mandiri.jsx";
import './App.css';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PendaftaranMandiri />} />
        {/* <Route path="/halaman-lain" element={<PageLain />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
