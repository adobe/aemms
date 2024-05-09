import { div } from '../../scripts/dom-helpers.js';

export default function decorate(block) {
  // const leftDiv = div({ class: 'highlighted-vehicle' });
  const rightDiv = div({ class: 'vehicles-list' });
  let virtualDiv = 0;
  let metadataDiv = 0;
  [...block.children].forEach((row, r) => {
    if (row.querySelector('img')) {
      if (r > 0) {
        virtualDiv.appendChild(metadataDiv);
        rightDiv.appendChild(virtualDiv);
      }
      metadataDiv = div();
      virtualDiv = div();
      virtualDiv.appendChild(row);
      row.classList.add('vehicle');
    } else {
      row.classList.add('metadata');
      metadataDiv.appendChild(row);
    }
  });
  virtualDiv.appendChild(metadataDiv);
  rightDiv.appendChild(virtualDiv);
  const leftDiv = div({ class: 'highlighted-vehicle' }, rightDiv.querySelector('div').cloneNode(true));
  rightDiv.querySelectorAll('div').forEach((car) => {
    car.addEventListener('mouseover', () => {
      leftDiv.replaceChildren(car.cloneNode(true));
    });
  });
  block.replaceChildren(
    // TODO add car info
    leftDiv,
    rightDiv,
  );
}