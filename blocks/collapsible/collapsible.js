function decorateCollapsible(el) {
  const titles = el.querySelectorAll(':scope > div:nth-child(odd)');
  titles.forEach((title) => {
    title.classList.add('item-title');
    title.nextElementSibling.classList.add('item-content');
    title.addEventListener('click', () => {
      title.classList.toggle('open');
    });
  });
}

const els = document.querySelectorAll('.collapsible');
els.forEach((el) => {
  decorateCollapsible(el);
});
