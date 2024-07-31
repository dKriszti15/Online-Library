function authorize(roles = ['felhasznalo', 'admin', 'vendeg']) {
  return (req, res, next) => {
    // console.log(`${req.session.role}  VAGYOK`);
    if (!req.session.role) {
      res.status(401).send('Nem vagy bejelentkezve, VENDÉG módban vagy!');
    } else if (!roles.includes(req.session.role)) {
      res.status(403).send('Nincs hozzáférésed!');
    } else {
      next();
    }
  };
}

export default authorize;
