async function megjelenitOsszef(id) {
  const osszef = document.getElementById(`${id}osszef`);
  try {
    let valasz = await fetch(`/listaz/${id}`);
    valasz = await valasz.json();
    osszef.innerText = valasz.osszef;
  } catch (err) {
    console.log(err);
    osszef.innerText = 'Nem sikerült megjeleníteni!';
  }
}

async function torolKonyv(id) {
  const sor = document.getElementById(`${id}`);
  const osszef = document.getElementById(`${id}osszefSor`);

  try {
    let valasz = await fetch(`/torolkonyv/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isbn: id,
      }),
    });
    console.log(valasz.status);
    if (valasz.status === 200) {
      sor.remove();
      osszef.remove();
    }
    valasz = await valasz.json();
    console.log(osszef.parentNode);
  } catch (err) {
    console.log(err);
  }
}

window.onload = () => {
  const osszefoglalok = document.getElementsByClassName('isbnclass');
  Array.from(osszefoglalok).forEach((osszefoglalo) => {
    osszefoglalo.addEventListener('click', () => megjelenitOsszef(osszefoglalo.id));
  });

  const gombok = document.getElementsByClassName('gomb');
  Array.from(gombok).forEach((gomb) => {
    gomb.addEventListener('click', () => torolKonyv(gomb.parentNode.parentNode.id));
  });
};
