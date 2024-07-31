import db from './kolcsonzesek.db.js';
import KonyvF from './konyvek.db.js';
import FelhF from './felhasznalok.db.js';
import ErtekelesF from './ertekelesek.db.js';

export async function logKonyv(req) {
  try {
    const konyv = await KonyvF.beszurKonyv(req);
    console.log(`Affected rows: ${konyv.affectedRows}`);
    return 200;
  } catch (err2) {
    console.error(err2);
    return 500;
  }
}

export async function logFelh(req) {
  try {
    const felh = await FelhF.beszurFelh(req);
    console.log(`Affected rows: ${felh.affectedRows}`);
    return 200;
  } catch (err2) {
    console.error(err2);
    return 500;
  }
}

export async function logKolcsonzes(req) {
  try {
    const kolcsonzes = await db.beszurKolcs(req);
    console.log(`Affected rows: ${kolcsonzes.affectedRows}`);
  } catch (err) {
    console.error(err);
  }
}

export async function logErtekeles(req) {
  try {
    const ertekeles = await ErtekelesF.beszurErtekeles(req);
    console.log(`Affected rows: ${ertekeles.affectedRows}`);
  } catch (err) {
    console.error(err);
  }
}
