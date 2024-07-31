async function modosit(id) {
  const szerepkor = document.getElementById(`${id}szerep`);
  const gomb = document.getElementById(`${id}`);
  try {
    await fetch(`/szerepMod/${id}`);
    if (szerepkor.innerText === 'felhasznalo') {
      szerepkor.innerText = 'admin';
      gomb.innerText = 'Lefokoz';
    } else {
      szerepkor.innerText = 'felhasznalo';
      gomb.innerText = 'Előléptet';
    }
  } catch (err) {
    console.log(err);
    szerepkor.innerText = 'Nem sikerült módosítani!';
  }
}

window.onload = () => {
  const gombok = document.getElementsByClassName('gomb');
  Array.from(gombok).forEach((gomb) => {
    gomb.addEventListener('click', () => modosit(gomb.id));
  });
};
