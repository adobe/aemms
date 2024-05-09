// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

export default function decorate(block) {
  [...block.children].forEach((row, r) => {
    if (r > 0) {
      const nexticondiv = document.createElement('div');
      nexticondiv.style.left = [...row.children][1].textContent;
      nexticondiv.style.top = [...row.children][2].textContent;
      nexticondiv.setAttribute('data', [...row.children][0].textContent);
      nexticondiv.addEventListener('click', () => {
        if (!isDesktop.matches) {
          const isOnClick = nexticondiv.classList.contains('onclick');
          if (document.querySelector('.hotspot .onclick')) document.querySelector('.hotspot .onclick').classList.remove('onclick');
          if (!isOnClick) nexticondiv.classList.add('onclick');
        }
      });
      row.after(nexticondiv);
      row.remove();
    }
  });
}