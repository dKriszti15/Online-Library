import pool from './pool.js';

export class Ertekeles {
  async getSajatErtekelesek(felhnev) {
    const query = 'SELECT * FROM ertekelesek WHERE nev = ?';
    const ertekelesek = await pool.query(query, [felhnev]);
    return ertekelesek[0];
  }

  async getErtekelesek() {
    const query = 'SELECT * FROM ertekelesek';
    const ertekelesek = await pool.query(query);
    return ertekelesek[0];
  }

  async beszurErtekeles(req) {
    try {
      const query = 'INSERT INTO ertekelesek (isbn, cim, nev, ertekeles) VALUES (?, ?, ?, ?)';
      const [ert] = await pool.query(query, [req.body.isbn, req.body.cim, req.session.username, req.body.ertekeles]);
      return ert;
    } catch (err) {
      console.log(err);
      return -1;
    }
  }

  async torolErtekelesekIsbn(isbn) {
    const query = 'DELETE FROM ertekelesek WHERE isbn = ?;';

    try {
      await pool.query(query, [isbn]);
      return 1;
    } catch (err) {
      console.error(err);
      return null;
    }
  }
}
const ErtekelesF = new Ertekeles();

export default ErtekelesF;
