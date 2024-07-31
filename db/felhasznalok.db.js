import pool from './pool.js';

export class Felhasznalo {
  async getNevek() {
    const query = 'SELECT nev FROM felhasznalok';

    try {
      const [nevek] = await pool.execute(query);
      return nevek;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async getFelhasznalonevSzerepkor() {
    const query = 'SELECT nev, szerepkor FROM felhasznalok';

    try {
      const [nevek] = await pool.execute(query);
      return nevek;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async getSzerepkor(felhasznalonev) {
    const query = 'SELECT szerepkor FROM felhasznalok WHERE nev = ?';
    const szerepkor = await pool.query(query, [felhasznalonev]);
    return szerepkor[0][0].szerepkor;
  }

  async modositSzerepFelh(felhasznalonev, szerepkor) {
    try {
      const query2 = 'UPDATE felhasznalok SET szerepkor = ? WHERE nev = ?;';
      await pool.query(query2, [szerepkor, felhasznalonev]);

      return 1;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async getKeresettFelhasznalok(req) {
    let query = null;
    if (req.body.nev === '' && req.body.szerepkor === '') {
      query = 'SELECT nev, szerepkor FROM felhasznalok';
      const [nevek] = await pool.query(query);
      return nevek;
    }
    if (req.body.nev === '' && req.body.szerepkor !== '') {
      query = 'SELECT nev, szerepkor FROM felhasznalok WHERE szerepkor = ?';
      const [nevek] = await pool.query(query, [req.body.szerepkor]);
      return nevek;
    }
    if (req.body.nev !== '' && req.body.szerepkor === '') {
      query = 'SELECT nev, szerepkor FROM felhasznalok WHERE nev = ?';
      const [nevek] = await pool.query(query, [req.body.nev]);
      return nevek;
    }

    query = 'SELECT nev, szerepkor FROM felhasznalok WHERE nev = ? AND szerepkor = ?';
    const [nevek] = await pool.query(query, [req.body.nev, req.body.szerepkor]);
    return nevek;
  }

  async beszurFelh(req) {
    try {
      const query = 'INSERT INTO felhasznalok (nev, jelszo, szerepkor) VALUES (?, ?, ?)';
      const [felh] = await pool.query(query, [req.body.felhasznalonev, req.body.jelszo, req.body.szerepkor]);
      return felh;
    } catch (err) {
      console.log(err);
      return -1;
    }
  }

  async getJelszo(req) {
    const query = 'SELECT jelszo FROM felhasznalok WHERE nev = ?';
    const jelszo = await pool.query(query, [req.body.felhasznalonev]);
    if (jelszo[0].length === 0) {
      return null;
    }
    return jelszo[0][0].jelszo;
  }

  async modositFelh(req) {
    try {
      const query3 = 'UPDATE felhasznalok SET jelszo = ? WHERE nev = ?;';
      await pool.query(query3, [req.body.jelszo, req.session.username]);

      const query = 'UPDATE felhasznalok SET nev = ? WHERE nev = ?;';
      await pool.query(query, [req.body.felhasznalonev, req.session.username]);

      const query2 = 'UPDATE kolcsonzesek SET nev = ? WHERE nev = ?;';
      await pool.query(query2, [req.body.felhasznalonev, req.session.username]);

      return 1;
    } catch (err) {
      console.error(err);
      return null;
    }
  }
}

const FelhF = new Felhasznalo();

export default FelhF;
