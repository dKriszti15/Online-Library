import pool from './pool.js';

export class Kolcsonzes {
  async listRents() {
    const query = 'SELECT * FROM kolcsonzesek';
    const [eredm] = await pool.query(query);
    return eredm;
  }

  async beszurKolcs(req) {
    try {
      const query = 'INSERT INTO kolcsonzesek (isbn, nev) VALUES (?, ?)';
      console.log(`${req.body.isbn} + vs + ${req.session.username}`);
      const [eredm] = await pool.query(query, [req.body.isbn, req.session.username]);
      return eredm;
    } catch (err) {
      console.log(err);
      return -1;
    }
  }

  async torolKolcs(req) {
    const query = 'DELETE FROM kolcsonzesek WHERE isbn = ? AND nev = ?;';

    try {
      const [eredm] = await pool.query(query, [req.body.isbn, req.body.nev]);
      console.log(`${req.body.isbn} - vs - ${req.session.username}`);
      console.log(eredm.affectedRows);
      return eredm.affectedRows;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async getKolcsonzok() {
    const query = 'SELECT nev FROM kolcsonzesek';

    try {
      const [nevek] = await pool.query(query);
      return nevek;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async getKolcsonzottIsbnek() {
    const query = 'SELECT isbn FROM kolcsonzesek';

    try {
      const [kolcsonzottisbnek] = await pool.query(query);
      return kolcsonzottisbnek;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async getIsbnKolcsonzok(isbnker) {
    const query = 'SELECT * FROM kolcsonzesek WHERE isbn = ?';

    try {
      const [kolcsonzottisbnek] = await pool.query(query, [isbnker]);
      return kolcsonzottisbnek;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async getSajatKolcsonzesek(felhasznalonev) {
    const query = 'SELECT * FROM kolcsonzesek JOIN konyvek ON konyvek.isbn = kolcsonzesek.isbn WHERE nev = ?';

    try {
      const [kolcsonzesek] = await pool.query(query, [felhasznalonev]);
      return kolcsonzesek;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async torolSorIsbn(isbnker) {
    const query = 'DELETE FROM kolcsonzesek WHERE isbn = ?';

    try {
      const [kolcsonzottisbnek] = await pool.query(query, [isbnker]);
      // console.log(rentedisbnek.affectedRows);
      return kolcsonzottisbnek.affectedRows;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async torolSorNevIsbn(felhasznalonev, isbnker) {
    const query = 'DELETE FROM kolcsonzesek WHERE nev = ? AND isbn = ?';

    try {
      const [kolcsonzottisbnek] = await pool.query(query, [felhasznalonev, isbnker]);
      return kolcsonzottisbnek.affectedRows;
    } catch (err) {
      console.error(err);
      return null;
    }
  }
}

const KolcsF = new Kolcsonzes();

export default KolcsF;
