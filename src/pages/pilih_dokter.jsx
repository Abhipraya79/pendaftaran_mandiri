import React, { useEffect, useState } from "react";
import { getJadwalDokterHarian } from "../api/pendaftaran";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import AOS from 'aos';
import 'aos/dist/aos.css';
import "../App.css";
import { User, Hash, Calendar } from "lucide-react";

const MySwal = withReactContent(Swal);

function formatJam(jam) {
  if (!jam) return "";
  const parts = jam.split(" ")[1]?.split(":");
  return parts ? `${parts[0]}:${parts[1]}` : jam;
}

function getWaktuSekarang() {
  const now = new Date();
  const hari = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"][now.getDay()];
  const bulan = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"][now.getMonth()];
  const tgl = now.getDate();
  const th = now.getFullYear();
  const jam = now.toLocaleTimeString('id-ID', { hour12: false });
  return `${hari}, ${tgl} ${bulan} ${th} ${jam} WIB`;
}

function isHabis(beginTime, endTime) {
  if (!endTime) return false;
  const now = new Date();
  const [h,m] = endTime.split(" ")[1].split(":");
  const end = new Date(now);
  end.setHours(Number(h), Number(m), 0, 0);
  return now > end;
}

const PilihDokter = () => {
  const [jadwal, setJadwal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");
  const [waktuSekarang, setWaktuSekarang] = useState(getWaktuSekarang());
  const navigate = useNavigate();
  const location = useLocation();
  const pasien = location.state?.pasien;

  useEffect(() => {
    AOS.init({ duration:800, easing:'ease-in-out', once:true, offset:50, delay:100 });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setWaktuSekarang(getWaktuSekarang()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getJadwalDokterHarian();
        if (result.response && Array.isArray(result.response)) {
          setJadwal(result.response);
          setTimeout(() => AOS.refresh(), 100);
        } else {
          setErrMsg("Data jadwal dokter kosong.");
        }
      } catch (err) {
        setErrMsg("Gagal mengambil data jadwal dokter.");
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handlePilihDokter = (dokter) => {
    navigate("/konfirmasi-pendaftaran", {
      state: {
        pasien,
        dokter: {
          id: dokter.dokterId,
          dokterName: dokter.dokterName,
          jamPraktek: `${formatJam(dokter.beginTime)} - ${formatJam(dokter.endTime)}`
        }
      }
    });
  };

  const handleBatal = async () => {
    const result = await MySwal.fire({
      title: "Batalkan Pendaftaran?",
      text: "Data yang diisi akan dihapus dan kembali ke halaman awal.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, batalkan",
      cancelButtonText: "Tidak",
    });
    if (result.isConfirmed) navigate("/");
  };

  // Hitung jumlah dokter yang sedang praktek
  const dokterPraktek = jadwal.filter(j => !isHabis(j.beginTime, j.endTime)).length;

  if (!pasien) {
    return (
      <div className="pendaftaran-bg">
        <div className="box-validasi" data-aos="fade-up">
          <h2>Data pasien tidak ditemukan</h2>
          <div>Silahkan ulangi proses pendaftaran.</div>
          <button className="pendaftaran-back-btn" onClick={() => navigate("/")}>Kembali</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pendaftaran-bg" style={{ minHeight:"100vh", alignItems:"start", paddingTop:32 }}>
      <div className="box-validasi" style={{ width:"100%", maxWidth:1200, margin:"0 auto", background:"transparent", boxShadow:"none", padding:0 }}>
        
        <div style={{ display:"flex", justifyContent:"center", alignItems:"stretch", gap:16, marginBottom:24 }}>
          
          <div data-aos="fade-right">
            <button
              onClick={handleBatal}
              style={{
                background:"linear-gradient(135deg,#ef4444,#b91c1c)",
                color:"#fff",
                border:"none",
                borderRadius:16,
                padding:"0 24px",
                height:"100%",
                minHeight:"165px",
                fontWeight:700,
                fontSize:16,
                cursor:"pointer",
                boxShadow:"0 4px 16px rgba(239,68,68,0.3)",
                transition:"all 0.2s",
                display:"flex",
                alignItems:"center",
                justifyContent:"center",
                whiteSpace:"nowrap"
              }}
              onMouseEnter={(e) => e.target.style.transform = "translateY(-2px)"}
              onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
            >
              Batalkan Pendaftaran
            </button>
          </div>

          {!loading && !errMsg && (
            <div 
              data-aos="fade-up"
              data-aos-delay="150"
              style={{
                background:"white",
                borderRadius:16,
                overflow:"hidden",
                minWidth:"320px",
                border:"1px solid #e2e8f0",
                boxShadow:"0 4px 20px rgba(0,0,0,0.06)",
                display:"flex",
                flexDirection:"column"
              }}
            >
              <div style={{ background:"linear-gradient(135deg, #22c55e, #16a34a)", color:"#fff", fontWeight:700, padding:"14px 20px", fontSize:20 }}>
                📊 Dokter Praktek Hari Ini
              </div>
              
              <div style={{ 
                padding:"24px 26px", 
                display:"flex", 
                flexDirection:"column", 
                justifyContent:"center",
                alignItems:"center",
                flex:1,
                background:"linear-gradient(to bottom, #f0fdf4, #dcfce7)"
              }}>
                <div style={{ fontSize:15, fontWeight:600, color:"#166534", marginBottom:8 }}>
                  Dokter Sedang Praktek
                </div>
                <div style={{ fontSize:52, fontWeight:800, lineHeight:1, color:"#15803d", marginBottom:8 }}>
                  {dokterPraktek}
                </div>
                <div style={{ fontSize:16, fontWeight:600, color:"#166534" }}>
                  Dokter
                </div>
                <div style={{ fontSize:13, fontWeight:500, color:"#16a34a", marginTop:8, textAlign:"center" }}>
                  Siap melayani Anda hari ini
                </div>
              </div>
            </div>
          )}

          <div
            data-aos="fade-left"
            data-aos-delay="300"
            style={{
              background:"white",
              borderRadius:16,
              overflow:"hidden",
              minWidth:"420px",
              border:"1px solid #e2e8f0",
              boxShadow:"0 4px 20px rgba(0,0,0,0.06)",
              display:"flex",
              flexDirection:"column"
            }}
          >
            <div style={{ background:"#2563eb", color:"#fff", fontWeight:700, padding:"14px 20px", fontSize:20 }}>
              🧾 Informasi Pasien
            </div>

            <div style={{ padding:"18px 26px", display:"grid", gridTemplateColumns:"160px 1fr", rowGap:12, columnGap:8, flex:1, alignContent:"center" }}>
              <div style={{ display:"flex", alignItems:"center", fontWeight:600 }}>
                <User size={18} style={{ marginRight:8, color:"#2563eb" }}/> Nama Pasien
              </div>
              <div>: {pasien.pxName}</div>

              <div style={{ display:"flex", alignItems:"center", fontWeight:600 }}>
                <Hash size={18} style={{ marginRight:8, color:"#2563eb" }}/> No RM
              </div>
              <div>: {pasien.id}</div>

              <div style={{ display:"flex", alignItems:"center", fontWeight:600 }}>
                <Calendar size={18} style={{ marginRight:8, color:"#2563eb" }}/> Tanggal Lahir
              </div>
              <div>: {pasien.pxBirthdate}</div>
            </div>
          </div>

        </div>

        {/* ======================= MULAI DARI SINI TIDAK ADA PERUBAHAN ======================= */}

        <h1 
          className="pendaftaran-title" 
          style={{ fontSize: 28, color: "#2a3450", marginBottom: 6 }}
          data-aos="fade-up"
          data-aos-delay="300"
        >
          Jadwal Praktek Dokter Klinik Muhammadiyah Lamongan
        </h1>

        <div 
          style={{
            background: "#2563eb",
            color: "#fff",
            fontWeight: 700,
            borderRadius: 12,
            padding: "14px 0",
            textAlign: "center",
            fontSize: 19,
            margin: "18px 0 12px 0"
          }}
          data-aos="zoom-in"
          data-aos-delay="400"
        >
          Pilih Dokter / Poli Tujuan
        </div>

        <div 
          style={{
            textAlign: "center",
            fontSize: 18,
            fontWeight: 600,
            marginBottom: 18,
            color: "#2a3450",
          }}
          data-aos="fade-up"
          data-aos-delay="500"
        >
          Waktu Sekarang: <span style={{ color: "#2563eb" }}>{waktuSekarang}</span>
        </div>

        {loading && (<div data-aos="fade-in">Mengambil data jadwal dokter...</div>)}

        {errMsg && (<div style={{ color:"red" }} data-aos="fade-in">{errMsg}</div>)}

        {!loading && !errMsg && (
          <div style={{
            display:"grid",
            gridTemplateColumns:"repeat(auto-fit, minmax(320px, 1fr))",
            gap:38,
            marginTop:18,
            padding:"0 20px 44px 20px",
          }}>
            {jadwal.length === 0 ? (
              <div style={{ gridColumn:"1/-1", textAlign:"center", color:"#444" }} data-aos="fade-in">
                Tidak ada dokter ditemukan.
              </div>
            ) : jadwal.map((j, idx) => {
              const habis = isHabis(j.beginTime, j.endTime);
              return (
                <div key={idx} style={{
                    background:"#fff", borderRadius:28, boxShadow:"0 6px 24px #0002",
                    padding:"38px 18px 30px 18px", display:"flex", flexDirection:"column",
                    alignItems:"center", maxWidth:"100%", minHeight:440,
                  }}
                  data-aos="fade-up"
                  data-aos-delay={idx * 150}
                  data-aos-anchor-placement="top-bottom"
                >
                  <img
                    src={j.photo?.startsWith("data:image") ? j.photo : (j.photo ? `data:image/jpeg;base64,${j.photo}` : "/no-foto.png")}
                    alt={j.dokterName}
                    style={{
                      maxWidth:140, height:160, objectFit:"cover",
                      borderRadius:16, marginBottom:14
                    }}
                    data-aos="zoom-in"
                    data-aos-delay={idx * 150 + 200}
                  />
                  <div style={{ fontWeight:800, fontSize:22, color:"#413096", textAlign:"center", minHeight:60 }}
                    data-aos="fade-up"
                    data-aos-delay={idx * 150 + 300}
                  >
                    {j.dokterName}
                  </div>
                  <div style={{ fontSize:17, color:"#464646", marginTop:7 }}
                    data-aos="fade-up"
                    data-aos-delay={idx * 150 + 400}
                  >
                    <span style={{ fontWeight:600 }}>Kode DPJP: {j.dpjp || "-"}</span>
                  </div>
                  <div style={{
                      background:"#d6e2ff", borderRadius:10,
                      padding:"13px 0", fontSize:19, color:"#444",
                      fontWeight:700, width:"96%", margin:"12px 0 24px 0",
                      textAlign:"center"
                    }}
                    data-aos="slide-up"
                    data-aos-delay={idx * 150 + 500}
                  >
                    {formatJam(j.beginTime)} WIB - {formatJam(j.endTime)} WIB
                  </div>
                  <div style={{ width:"100%", textAlign:"center" }}
                    data-aos="fade-up"
                    data-aos-delay={idx * 150 + 600}
                  >
                    {habis ? (
                      <div style={{
                        padding:"11px 0", background:"#fde7e7", color:"#d32f2f",
                        borderRadius:10, fontWeight:800, fontSize:20
                      }}>
                        Jam Praktek Telah Habis
                      </div>
                    ) : (
                      <button
                        style={{
                          width:"100%", padding:"17px 0", background:"#22c55e",
                          borderRadius:10, color:"#fff", fontWeight:800,
                          fontSize:22, border:"none", cursor:"pointer",
                        }}
                        onClick={() => handlePilihDokter(j)}
                      >
                        Buat Janji
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PilihDokter;