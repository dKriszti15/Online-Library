import KonyvF from '../db/konyvek.db.js';

const validalErtekeles = async (req, res, next) => {
  const { isbn, cim, ertekeles } = req.body;

  if (isbn < 9780000000000 || isbn > 9799999999999) {
    return res.status(400).send('ISBN 13 szamjegyű kell legyen, első 3 számjegy 978 vagy 979 kell legyen!');
  }

  const cimek = await KonyvF.getCimek();

  if (!cimek.some((sor) => sor.cim === cim)) {
    return res.status(400).send('Nem létezik a megadott cím!');
  }

  if (cim === '') {
    return res.status(400).send('Nem adtál meg címet!');
  }

  if (ertekeles > 10 || ertekeles < 1) {
    return res.status(400).send('Értékelés [1,10] közötti kell legyen!');
  }

  next();
  return res.status(200);
};

export default validalErtekeles;
