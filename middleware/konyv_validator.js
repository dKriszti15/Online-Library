import fs from 'fs/promises';

const delFile = (req) => {
  if (req.file) {
    try {
      fs.unlink(req.file.path);
    } catch (err) {
      console.error('Hiba: f ájl törlése közben:', err);
    }
  }
};

const validalKonyv = (req, res, next) => {
  const { isbn, cim, szerzo, megjev, osszef, peldanyok } = req.body;

  if (isbn < 9780000000000 || isbn > 9799999999999) {
    delFile(req);
    return res.status(400).send('ISBN 13 szamjegyű kell legyen, első 3 számjegy 978 vagy 979 kell legyen!');
  }

  if (cim === '') {
    delFile(req);
    return res.status(400).send('Nem adtál meg címet!');
  }

  if (szerzo === '') {
    delFile(req);
    return res.status(400).send('Nem adtál meg szerzőt!');
  }

  if (megjev > 2024 || megjev < 1) {
    delFile(req);
    return res.status(400).send('Kiadási év [1,2024] közötti kell legyen!');
  }

  if (osszef === '') {
    delFile(req);
    return res.status(400).send('Nem adtál semmi összefoglalót!');
  }

  if (!req.file) {
    delFile(req);
    return res.status(400).send('Nem adtál meg borítót!');
  }

  if (peldanyok < 1) {
    delFile(req);
    return res.status(400).send('Legalább 1 példányt be kell vezetni!');
  }
  next();
  return res.status(200);
};

export default validalKonyv;
