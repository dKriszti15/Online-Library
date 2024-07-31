import express from 'express';
import bcrypt from 'bcrypt';
import ErtekelesF from '../db/ertekelesek.db.js';
import validalErtekeles from '../middleware/ertekeles_validator.js';
import authorize from '../middleware/authorizacio.js';
import FelhF from '../db/felhasznalok.db.js';
import KolcsF from '../db/kolcsonzesek.db.js';
import { logErtekeles } from '../db/beszurasok.js';

const szemelyes = express.Router();

szemelyes.get('/kolcsonzesek/:nev', authorize(['felhasznalo', 'admin']), express.json(), async (req, res) => {
  const parameterek = req.params;
  const { nev } = parameterek;
  if (req.session.username === nev) {
    const sajatKonyvek = await KolcsF.getSajatKolcsonzesek(nev);
    if (sajatKonyvek) {
      res.status(200).render('listazSajat.ejs', {
        reszletek: sajatKonyvek,
        message: '',
        bejelentkezettFelhasznalo: req.session.username,
      });
    }
  }
});

szemelyes.get('/adatokModositasa', authorize(['felhasznalo', 'admin']), (req, res) => {
  res.status(200).render('modositas.ejs', { uzenet: '' });
});

szemelyes.post('/adatokModositasa', authorize(['felhasznalo', 'admin']), async (req, res) => {
  try {
    const felhasznalonevek = await FelhF.getNevek();

    if (felhasznalonevek.some((sor) => sor.nev === req.body.felhasznalonev)) {
      res.status(200).render('modositas.ejs', { uzenet: 'Ez a felhasználó már létezik.' });
    } else if (req.body.jelszo !== req.body.jelszoismet) {
      res.status(200).render('modositas.ejs', { uzenet: 'A két jelszó nem egyezik!' });
    } else {
      req.body.jelszo = await bcrypt.hash(req.body.jelszo, 10);
      await FelhF.modositFelh(req);
      req.session.username = req.body.felhasznalonev;
      res.status(200).render('modositas.ejs', { uzenet: 'Sikeres módosítás!' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).render('modositas.ejs', { uzenet: 'Hiba történt a módosítás során.' });
  }
});

szemelyes.get('/ertekelesek/:nev', authorize(['felhasznalo', 'admin']), async (req, res) => {
  const ertekelesekk = await ErtekelesF.getSajatErtekelesek(req.session.username);
  res.status(200).render('ertekelesek.ejs', {
    bejelentkezettFelhasznalo: req.session.username,
    uzenet: '',
    ertekelesek: ertekelesekk,
  });
});

szemelyes.post('/ertekelesek/:nev', authorize(['felhasznalo', 'admin']), (req, res) => {
  validalErtekeles(req, res, async (err3) => {
    if (err3) {
      console.error('Értékelés validálási hiba.');
      res.sendStatus(400);
      return;
    }
    let ertekelesekk = await ErtekelesF.getSajatErtekelesek(req.session.username);
    if (ertekelesekk.some((sor) => sor.isbn === req.body.isbn)) {
      res.status(200).render('ertekelesek.ejs', {
        bejelentkezettFelhasznalo: req.session.username,
        uzenet: 'Már értékelted ezt a könyvet.',
        ertekelesek: ertekelesekk,
      });
    } else {
      await logErtekeles(req);
      ertekelesekk = await ErtekelesF.getSajatErtekelesek(req.session.username);
      console.log(ertekelesekk);
      res.status(200).render('ertekelesek.ejs', {
        bejelentkezettFelhasznalo: req.session.username,
        uzenet: 'Sikeres értékelés!',
        ertekelesek: ertekelesekk,
      });
    }
  });
});

export default szemelyes;
