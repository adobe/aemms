import { decorateBlock, loadBlocks } from '../../scripts/lib-franklin.js';
import { constants } from './aria-accordion.js';

function updateHeightValues(block) {
  setTimeout(() => {
    const accordions = block.querySelectorAll('.accordion-section');
    [...accordions].forEach((accordion) => {
      const text = accordion.querySelector('.text');
      const region = accordion.querySelector('[role="region"]');
      const height = text.offsetHeight;
      const heightValue = height ? `${height}px` : 'auto';
      region.style.maxHeight = `calc(${heightValue} * 2)`;
      region.style.minHeight = heightValue;
    });
  }, 100);
}

export default async function decorateNestedAccordion(block) {
  const accordions = [...block.children];
  accordions.forEach((accordion) => {
    accordion.classList.add('accordion-section');
    accordion.firstElementChild.classList.add('header');
    if (accordion.firstElementChild.querySelector('br')) {
      accordion.firstElementChild.classList.add('is-multiline');
    }
    accordion.firstElementChild.nextElementSibling.classList.add('text');
    const lastElementChildHTML = accordion.lastElementChild.innerHTML;
    if (lastElementChildHTML === 'expand') {
      accordion.firstElementChild.nextElementSibling.classList.add('default-expand');
      accordion.lastElementChild.remove();
    } else if (lastElementChildHTML === '') {
      accordion.lastElementChild.remove();
    }
  });
  const element = document.createElement(constants.tagName);
  element.innerHTML = block.innerHTML;
  block.innerHTML = '';
  block.append(element);
  block.querySelectorAll('p:empty').forEach((el) => el.remove());

  const textDivs = block.querySelectorAll('.text');

  // fetch dynamic content
  let hasAsyncBlocks = false;
  await Promise.all([...textDivs].map(async (text) => {
    text.parentElement.setAttribute('aria-live', 'off');
    const path = new URL(text.textContent).pathname;
    if (!path) {
      return;
    }
    try {
      const resp = await fetch(`${path}.plain.html`);
      if (resp.ok) {
        const content = await resp.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html').body.firstChild;
        text.classList.remove('button-container');
        text.innerHTML = '';
        text.appendChild(doc);
        text.firstElementChild.querySelectorAll(':scope > div')
          .forEach(decorateBlock);
        hasAsyncBlocks = true;
      }
    } catch (err) {
      text.parentElement.remove();
    }
  }));
  if (hasAsyncBlocks) {
    await loadBlocks(document.querySelector('main'));
  }

  // inline height values for accordion sections
  updateHeightValues(block);
  block.setAttribute('data-complete', 'true');
}

const accordionNested = document.querySelectorAll('.accordion.nested');
accordionNested.forEach((el) => {
  decorateNestedAccordion(el);
});
