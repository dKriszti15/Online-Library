import express from 'express';
import bcrypt from 'bcrypt';
import { logKolcsonzes, logFelh } from '../db/beszurasok.js';
import KonyvF from '../db/konyvek.db.js';
import FelhF from '../db/felhasznalok.db.js';
import KolcsF from '../db/kolcsonzesek.db.js';
import authorize from '../middleware/authorizacio.js';

const altalanos = express.Router();

altalanos.get('/', async (req, res) => {
  const konyveklista = await KonyvF.listazKonyvekMinden(req);
  const host = req.hostname;
  const { port } = req.serverInfo;

  res.status(200).render('listaz.ejs', {
    konyvlista: konyveklista,
    host,
    port,
    bejelentkezettFelhasznalo: req.session.username,
    bejelFelhSzerepkor: req.session.role,
  });
});

altalanos.get('/form2.ejs', authorize(['admin', 'felhasznalo']), (req, res) => {
  res.status(200).render('form2.ejs', { bejelentkezettFelhasznalo: req.session.username, uzenet: '' });
});

altalanos.post('/form2.ejs', async (req, res, next) => {
  const message = `Megkapta az infót a form2-től:
  nev :${req.body.nev}
  isbn:${req.body.isbn}
  muvelet:${req.body.muvelet}
  `;
  console.log(message);
  let nevek = await FelhF.getNevek();
  if (req.body.muvelet === 'kolcsonoz') {
    const peldanyok = await KonyvF.getPeldanyok(req.body.isbn);
    if (peldanyok.peldanyok <= 0) {
      res.status(404).render('form2.ejs', {
        bejelentkezettFelhasznalo: req.session.username,
        uzenet: `${req.body.nev} nem tudta kikölcsönözni a <${req.body.isbn}> könyvet, mert nincs raktáron.`,
      });
    } else {
      await KonyvF.decPeldanyok(req.body.isbn);
      await logKolcsonzes(req);
      res.status(200).render('form2.ejs', {
        bejelentkezettFelhasznalo: req.session.username,
        uzenet: `${req.body.nev} sikeresen kikölcsönözte a <${req.body.isbn}> könyvet.`,
      });
    }
  } else {
    let van = 0;
    nevek = await KolcsF.getKolcsonzok();
    const kolcsonzottisbnek = await KolcsF.getKolcsonzottIsbnek();

    const talaltsor = nevek.find((row) => {
      const talaltrentsor = kolcsonzottisbnek.find((rrow) => rrow.isbn === req.body.isbn);
      if (talaltrentsor) {
        return row.nev === req.body.nev && talaltrentsor.isbn === req.body.isbn;
      }

      return false;
    });

    if (talaltsor) {
      van = 1;
      await KonyvF.incPeldanyok(req.body.isbn);
      await KolcsF.torolKolcs(req);
      res.status(200).render('form2.ejs', {
        bejelentkezettFelhasznalo: req.session.username,
        uzenet: `${req.body.nev} sikeresen visszaszolgáltatta a <${req.body.isbn}> könyvet.`,
      });
    }

    if (!van) {
      res.status(404).render('form2.ejs', {
        bejelentkezettFelhasznalo: req.session.username,
        uzenet: `${req.body.nev} nem tudja visszaszolgáltatni a <${req.body.isbn}> könyvet, mert nem kölcsönözte ki.`,
      });
    }
  }
  next();
});

altalanos.post('/form3.ejs', async (req, res, next) => {
  const message = `Megkapta az infót a form3-tól:
  cim :${req.body.cim}
  szerzo:${req.body.szerzo}
  minev:${req.body.minev}
  maxev:${req.body.maxev}
  raktaron:${req.body.raktaron}
  `;
  console.log(message);

  async function listazON() {
    const talalatok = await KonyvF.listazElerhetoKonyvek(req);
    return talalatok;
  }

  async function listazOFF() {
    const talalatok = await KonyvF.listazKonyvek(req);
    return talalatok;
  }

  let talalatok;
  if (req.body.raktaron === 'on') {
    talalatok = await listazON();
  } else {
    talalatok = await listazOFF();
  }
  res.status(200).send(talalatok);
  next();
});

altalanos.post('/listaz.ejs', async (req, res, next) => {
  async function listazON() {
    const talalatok = await KonyvF.listazElerhetoKonyvekSzurveMindennel(req);
    return talalatok;
  }

  async function listazOFF() {
    const talalatok = await KonyvF.listazKonyvekSzurveMindennel(req);
    return talalatok;
  }

  let talalatok;
  if (req.body.raktaron === 'on') {
    talalatok = await listazON();
  } else {
    talalatok = await listazOFF();
  }

  const host = req.hostname;
  const { port } = req.serverInfo;
  res.status(200).render('listaz.ejs', {
    konyvlista: talalatok,
    host,
    port,
    bejelentkezettFelhasznalo: req.session.username,
    bejelFelhSzerepkor: req.session.role,
  });
  next();
});

altalanos.post('/reszletek.ejs', async (req, res) => {
  let nevek = await FelhF.getNevek();

  if (req.body.muvelet === 'kolcsonoz') {
    const peldanyok = await KonyvF.getPeldanyok(req.body.isbn);

    if (peldanyok.peldanyok <= 0) {
      const kolcsonzesek = await KolcsF.getIsbnKolcsonzok(req.body.isbn);
      let pathh = await KonyvF.getBorito(req.body.isbn);
      pathh = `/uploads/${pathh.borito}`;
      const { isbn } = req.body;
      const nevekk = await FelhF.getNevek();
      res.status(404).render('reszletek.ejs', {
        reszletek: kolcsonzesek,
        pathh,
        isbn,
        names: nevekk,
        message: 'Nem tudta kikölcsönözni, mert nincs raktáron.',
        bejelentkezettFelhasznalo: req.session.username,
      });
    } else {
      await KonyvF.decPeldanyok(req.body.isbn);
      await logKolcsonzes(req);
      await KonyvF.incOsszkolcs(req.body.isbn);

      const kolcsonzesek = await KolcsF.getIsbnKolcsonzok(req.body.isbn);
      let pathh = await KonyvF.getBorito(req.body.isbn);
      pathh = `/uploads/${pathh.borito}`;
      const { isbn } = req.body;
      const nevekk = await FelhF.getNevek();
      res.status(200).render('reszletek.ejs', {
        reszletek: kolcsonzesek,
        pathh,
        isbn,
        names: nevekk,
        message: 'Sikeresen kikölcsönözte!',
        bejelentkezettFelhasznalo: req.session.username,
      });
    }
  } else {
    let van = 0;
    nevek = await KolcsF.getKolcsonzok();
    const kolcsonzottisbnek = await KolcsF.getKolcsonzottIsbnek();

    const talaltsor = nevek.find((row) => {
      const talaltrentsor = kolcsonzottisbnek.find((rrow) => rrow.isbn === req.body.isbn);

      if (talaltrentsor) {
        return row.nev === req.body.nev && talaltrentsor.isbn === req.body.isbn;
      }

      return false;
    });

    if (talaltsor) {
      van = 1;
      await KonyvF.incPeldanyok(req.body.isbn);
      await KolcsF.torolKolcs(req);
      const kolcsonzesek = await KolcsF.getIsbnKolcsonzok(req.body.isbn);
      let pathh = await KonyvF.getBorito(req.body.isbn);
      pathh = `/uploads/${pathh.borito}`;
      const { isbn } = req.body;
      const nevekk = await FelhF.getNevek();
      res.status(200).render('reszletek.ejs', {
        reszletek: kolcsonzesek,
        pathh,
        isbn,
        names: nevekk,
        message: 'Sikeresen visszaszolgáltatta!',
        bejelentkezettFelhasznalo: req.session.username,
      });
    }

    if (!van) {
      const kolcsonzesek = await KolcsF.getIsbnKolcsonzok(req.body.isbn);
      let pathh = await KonyvF.getBorito(req.body.isbn);
      pathh = `/uploads/${pathh.borito}`;
      const { isbn } = req.body;
      const nevekk = await FelhF.getNevek();
      res.status(404).render('reszletek.ejs', {
        reszletek: kolcsonzesek,
        pathh,
        isbn,
        names: nevekk,
        message: 'Nem tudta visszaszolgáltatni, mert nem kölcsönözte ki.',
        bejelentkezettFelhasznalo: req.session.username,
      });
    }
  }
  res.status(400);
});

altalanos.get('/konyv/*', authorize(['felhasznalo', 'admin']), async (req, res) => {
  let isbn = req.url.split('/');
  isbn = isbn.slice(2).join('/');
  const konyv = await KonyvF.getKonyv(isbn);
  if (konyv[0].length === 0) {
    res.status(404).render('error.ejs', {
      message: 'Nem letezik ilyen konyv a konyvtarban',
      bejelentkezettFelhasznalo: req.session.username,
    });
  } else {
    const kolcsonzesek = await KolcsF.getIsbnKolcsonzok(isbn);
    let pathh = await KonyvF.getBorito(isbn);
    pathh = `/uploads/${pathh.borito}`;
    const nevekk = await FelhF.getNevek();
    res.status(200).render('reszletek.ejs', {
      reszletek: kolcsonzesek,
      pathh,
      isbn,
      names: nevekk,
      message: '',
      bejelentkezettFelhasznalo: req.session.username,
    });
  }
});

altalanos.get('/listaz/:isbn', express.json(), authorize(['felhasznalo', 'admin']), async (req, res) => {
  const osszefoglalo = await KonyvF.getKonyvOsszef(req.params.isbn);
  if (!osszefoglalo) {
    return res.status(404);
  }
  return res.json({ osszef: osszefoglalo });
});

altalanos.delete('/reszletek/:nev/:isbn', express.json(), authorize(['felhasznalo', 'admin']), async (req, res) => {
  const parameterek = req.params;
  console.log(parameterek);
  const { isbn } = parameterek;
  const { nev } = parameterek;
  const aux = await KolcsF.torolSorNevIsbn(nev, isbn);
  if (aux) {
    await KonyvF.incPeldanyok(isbn);
    return res.status(200).json({ message: 'Sikeresen törölve!', bejelentkezettFelhasznalo: req.session.username });
  }
  return res.status(500).json({ message: 'Nem sikerült törölni!', bejelentkezettFelhasznalo: req.session.username });
});

altalanos.get('/bejelentkezes', (req, res) => {
  res.status(200).render('bejelentkezes.ejs', { uzenet: '' });
});

altalanos.post('/bejelentkezes', express.json(), async (req, res) => {
  const helyesjelszo = await FelhF.getJelszo(req);
  if (helyesjelszo === null) {
    res.status(405).render('bejelentkezes.ejs', { uzenet: 'Nem létezik ez a felhasználó!' });
  } else {
    const helyes = await bcrypt.compare(req.body.jelszo, helyesjelszo);
    if (helyes) {
      req.session.username = req.body.felhasznalonev;
      const szerepkor = await FelhF.getSzerepkor(req.session.username);
      req.session.role = szerepkor;
      const konyveklista = await KonyvF.listazKonyvekMinden(req);
      const host = req.hostname;
      const { port } = req.serverInfo;

      res.status(200).render('listaz.ejs', {
        konyvlista: konyveklista,
        host,
        port,
        bejelentkezettFelhasznalo: req.session.username,
        bejelFelhSzerepkor: req.session.role,
      });
    } else {
      res.status(405).render('bejelentkezes.ejs', { uzenet: 'Hibás jelszó!', bejelentkezettFelhasznalo: '' });
    }
  }
});

altalanos.get('/regisztracio', (req, res) => {
  res.status(200).render('regisztracio.ejs', { uzenet: '' });
});

altalanos.post('/regisztracio', async (req, res) => {
  const felhasznalonevek = await FelhF.getNevek();
  if (!felhasznalonevek.some((sor) => sor.nev === req.body.felhasznalonev)) {
    if (req.body.jelszo === req.body.jelszoismet) {
      req.body.jelszo = await bcrypt.hash(req.body.jelszo, 10);
      logFelh(req);
      res.status(200).render('regisztracio.ejs', { uzenet: 'Sikeres regisztráció!' });
    }
    res.status(200).render('regisztracio.ejs', { uzenet: 'A két jelszó nem egyezik!' });
  } else {
    res.status(200).render('regisztracio.ejs', { uzenet: 'Ez a felhasználó már létezik.' });
  }
});

altalanos.get('/kijelentkezes', (req, res) => {
  req.session.destroy(async (err) => {
    if (err) {
      res.status(500).send('Kijelentkezési hiba.');
    } else {
      const konyveklista = await KonyvF.listazKonyvekMinden(req);
      const host = req.hostname;
      const { port } = req.serverInfo;

      res.status(200).render('listaz.ejs', {
        konyvlista: konyveklista,
        host,
        port,
        bejelentkezettFelhasznalo: '',
        bejelFelhSzerepkor: '',
      });
    }
  });
});

export default altalanos;
