import express from 'express';
import multer from 'multer';
import validalKonyv from '../middleware/konyv_validator.js';
import authorize from '../middleware/authorizacio.js';
import KonyvF from '../db/konyvek.db.js';
import FelhF from '../db/felhasznalok.db.js';
import { logKonyv } from '../db/beszurasok.js';
import ErtekelesF from '../db/ertekelesek.db.js';

const admin = express.Router();

const upload = multer({
  dest: './public/uploads',
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Csak képeket tölthetsz fel!'), false);
    }
  },
});

admin.get('/form1.ejs', authorize(['admin']), (req, res) => {
  res.status(200).render('form1.ejs');
});

admin.post('/form1.ejs', authorize(['admin']), (req, res, next) => {
  upload.single('borito')(req, res, (err) => {
    if (err) {
      res.sendStatus(400);
      return;
    }
    validalKonyv(req, res, async (err2) => {
      if (err2) {
        console.error('Validálási hiba.');
        res.sendStatus(400);
        return;
      }

      const message = `Megkapta az infót a form1-től:
      nev:${req.body.isbn}
      cim:${req.body.cim}
      szerzo:${req.body.szerzo}
      kiadasi:${req.body.megjev}
      osszef:${req.body.osszef}
      boritokep:${req.file.originalname}
      db:${req.body.peldanyok}
      `;

      console.log(message);

      let isbnek = await KonyvF.getIsbn();

      if (isbnek.some((row) => row.isbn === req.body.isbn)) {
        res.status(200).send('Már létezik ez a könyv.');
      } else {
        await logKonyv(req);
        isbnek = await KonyvF.getIsbn();
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
      }
      console.log('ISBN-ek:', isbnek);
      next();
    });
  });
});

admin.get('/felhasznalokAdmin', authorize(['admin']), async (req, res) => {
  const felhasznalok = await FelhF.getFelhasznalonevSzerepkor();
  res
    .status(200)
    .render('felhAdmin.ejs', { felhasznaloLista: felhasznalok, bejelentkezettFelhasznalo: req.session.username });
});

admin.get('/szerepMod/:felhasznalonev', authorize(['admin']), async (req, res) => {
  const szerepkor = await FelhF.getSzerepkor(req.params.felhasznalonev);
  if (szerepkor === 'admin') {
    await FelhF.modositSzerepFelh(req.params.felhasznalonev, 'felhasznalo');
  } else {
    await FelhF.modositSzerepFelh(req.params.felhasznalonev, 'admin');
  }
  res.status(200).end();
});

admin.post('/felhAdmin.ejs', authorize(['admin']), async (req, res) => {
  const talaltFelhasznalok = await FelhF.getKeresettFelhasznalok(req);
  res.status(200).render('felhAdmin.ejs', {
    felhasznaloLista: talaltFelhasznalok,
    bejelentkezettFelhasznalo: req.session.username,
  });
});

admin.delete('/torolkonyv/:isbn', authorize(['admin']), async (req, res) => {
  await KonyvF.torolKonyv(req.params.isbn);
  console.log('SZIAIAIAIA');
  await ErtekelesF.torolErtekelesekIsbn(req.params.isbn);
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

export default admin;
