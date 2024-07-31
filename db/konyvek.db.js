import pool from './pool.js';

export class Konyv {
  async listazKonyvekMinden(req) {
    const query = 'SELECT * FROM konyvek ORDER BY osszkolcsonzesek DESC;';
    const [konyvek] = await pool.query(query, [req.body.minev, req.body.maxev, req.body.cim, req.body.szerzo]);
    return konyvek;
  }

  async listazElerhetoKonyvekSzurveMindennel(req) {
    const query =
      'SELECT * FROM konyvek WHERE kiadasi_ev >= ? AND kiadasi_ev <= ? AND cim LIKE ? AND szerzo LIKE ? AND peldanyok > 0 ORDER BY osszkolcsonzesek DESC;';
    const [konyvek] = await pool.query(query, [req.body.minev, req.body.maxev, req.body.cim, req.body.szerzo]);
    return konyvek;
  }

  async listazKonyvekSzurveMindennel(req) {
    const query =
      'SELECT * FROM konyvek WHERE kiadasi_ev >= ? AND kiadasi_ev <= ? AND cim LIKE ? AND szerzo LIKE ? ORDER BY osszkolcsonzesek DESC;';
    const [konyvek] = await pool.query(query, [req.body.minev, req.body.maxev, req.body.cim, req.body.szerzo]);
    return konyvek;
  }

  async listazKonyvek(req) {
    const query =
      'SELECT isbn FROM konyvek WHERE kiadasi_ev >= ? AND kiadasi_ev <= ? AND cim LIKE ? AND szerzo LIKE ? ORDER BY osszkolcsonzesek DESC;';
    const [konyvek] = await pool.query(query, [req.body.minev, req.body.maxev, req.body.cim, req.body.szerzo]);
    return konyvek;
  }

  async listazElerhetoKonyvek(req) {
    const query =
      'SELECT isbn FROM konyvek WHERE kiadasi_ev >= ? AND kiadasi_ev <= ? AND cim LIKE ? AND szerzo LIKE ? AND peldanyok > 0 ORDER BY osszkolcsonzesek DESC;';
    const [konyvek] = await pool.query(query, [req.body.minev, req.body.maxev, req.body.cim, req.body.szerzo]);
    return konyvek;
  }

  async beszurKonyv(req) {
    try {
      const query =
        'INSERT INTO konyvek (isbn,cim,szerzo,kiadasi_ev,osszefoglalo,borito,peldanyok) VALUES (?,?,?,?,?,?,?)';
      const [konyv] = await pool.query(query, [
        req.body.isbn,
        req.body.cim,
        req.body.szerzo,
        req.body.megjev,
        req.body.osszef,
        req.file.filename,
        req.body.peldanyok,
      ]);
      return konyv;
    } catch (err) {
      console.log(err);
      return -1;
    }
  }

  async getIsbn() {
    const query = 'SELECT isbn FROM konyvek';

    try {
      const [isbnek] = await pool.query(query);
      return isbnek;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async getPeldanyok(isbnker) {
    const query = 'SELECT peldanyok FROM konyvek WHERE isbn = ?;';

    try {
      const mennyiseg = await pool.query(query, [isbnker]);
      return mennyiseg[0][0];
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async incPeldanyok(isbnker) {
    const query = 'UPDATE konyvek SET peldanyok = peldanyok + 1 WHERE isbn = ?;';

    try {
      await pool.query(query, [isbnker]);
      return 1;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async decPeldanyok(isbnker) {
    const query = 'UPDATE konyvek SET peldanyok = peldanyok - 1 WHERE isbn = ?;';

    try {
      await pool.query(query, [isbnker]);
      return 1;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async incOsszkolcs(isbnker) {
    const query = 'UPDATE konyvek SET osszkolcsonzesek = osszkolcsonzesek + 1 WHERE isbn = ?;';

    try {
      await pool.query(query, [isbnker]);
      return 1;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async getKonyv(isbnker) {
    const query = 'SELECT isbn FROM konyvek WHERE isbn = ?';

    try {
      const isbn = await pool.query(query, [isbnker]);
      return isbn;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async getCimek() {
    const query = 'SELECT cim FROM konyvek';
    const ertekelesek = await pool.query(query);
    return ertekelesek[0];
  }

  async getBorito(isbnker) {
    const query = 'SELECT borito FROM konyvek WHERE isbn = ?';
    const connection = await pool.getConnection();

    try {
      const borito = await connection.query(query, [isbnker]);
      return borito[0][0];
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async torolKonyv(isbn) {
    const query = 'DELETE FROM konyvek WHERE isbn = ?;';

    try {
      await pool.query(query, [isbn]);
      return 1;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async getKonyvOsszef(isbnker) {
    const query = 'SELECT osszefoglalo FROM konyvek WHERE isbn = ?';

    try {
      const [isbn] = await pool.query(query, [isbnker]);
      return isbn[0].osszefoglalo;
    } catch (err) {
      console.error(err);
      return null;
    }
  }
}

const KonyvF = new Konyv();

export default KonyvF;
