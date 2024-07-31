async function torolSor(id) {
  const parameterek = id.split('/');
  const sor = document.getElementById(`${id}`);
  console.log(id);
  try {
    let valasz = await fetch(`/reszletek/${parameterek[0]}/${parameterek[1]}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nev: parameterek[0],
        isbn: parameterek[1],
      }),
    });
    console.log(valasz.status);
    if (valasz.status === 200) {
      sor.remove();
    }
    valasz = await valasz.json();
    document.getElementById('uzenet').innerText = valasz.message;
  } catch (err) {
    console.log(err);
    document.getElementById('uzenet').innerText = 'Nem sikerült törölni!';
  }
}

window.onload = () => {
  const gombok = document.getElementsByClassName('gomb');
  Array.from(gombok).forEach((gomb) => {
    gomb.addEventListener('click', () => torolSor(gomb.parentNode.parentNode.id));
  });
};
