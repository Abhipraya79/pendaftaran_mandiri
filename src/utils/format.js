const LABEL_JENIS_KELAMIN = {
  L: "Laki-laki",
  P: "Perempuan",
};

export function formatJenisKelamin(kode) {
  return LABEL_JENIS_KELAMIN[kode] || "-";
}


export function joinRekmed(parts) {
  return parts.filter(Boolean).join(".");
}
