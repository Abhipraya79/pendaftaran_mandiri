import { cariPasienByNama, cariPasienByRekmed } from "../api/pendaftaran";

export async function searchPasienByNama(nama) {
  try {
    const res = await cariPasienByNama(nama);
    const arr = Array.isArray(res?.response) ? res.response : [];
    return { ok: true, data: arr };
  } catch (e) {
    return { ok: false, error: e };
  }
}

export async function getPasienByRekmed(rekmed) {
  try {
    const res = await cariPasienByRekmed(rekmed);
    const obj = res?.response && res.response.id ? res.response : null;
    return { ok: !!obj, data: obj };
  } catch (e) {
    return { ok: false, error: e };
  }
}
