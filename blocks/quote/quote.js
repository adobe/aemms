export default function decorate(block) {
  const grandChildren = block.children[0].children;

  if (grandChildren.length) {
    block.innerHTML = '';

    [...grandChildren].forEach((grandChild, index) => {
      if (index === 0) {
        grandChild.classList.add('quote-content');
      } else if (index === 1) {
        grandChild.classList.add('quote-caption');
      }
      block.appendChild(grandChild);
    });
  }
}
