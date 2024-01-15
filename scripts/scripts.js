/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import {
  sampleRUM,
  buildBlock,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
} from './lib-franklin.js';

const LCP_BLOCKS = []; // add your LCP blocks to the list
window.hlx.RUM_GENERATION = 'project-1'; // add your RUM generation information here

function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const h2 = main.querySelector('h2');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1, h2] }));
    main.prepend(section);
  }
}

function buildTocBlock(main) {
  const tocContainer = document.createElement('div');
  tocContainer.classList.add('toc-container');

  const tocWrapper = document.createElement('div');
  tocWrapper.classList.add('toc-wrapper');

  const toc = document.createElement('div');
  toc.classList.add('toc');

  tocWrapper.appendChild(toc);
  tocContainer.appendChild(tocWrapper);

  const heroContainer = document.querySelector('.hero-container');

  if (heroContainer) {
    main.insertBefore(tocContainer, heroContainer.nextSibling);
    // heroContainer.insertAdjacentElement('afterend', tocContainer);
  }

  const sections = document.querySelectorAll('.section:not(.hero-container)');

  sections.forEach((section) => {
    const h2 = section.querySelector('h2');

    if (h2) {
      const button = document.createElement('p');
      button.classList.add('button-container');

      const link = document.createElement('a');

      let textContent = '';
      h2.childNodes.forEach((node) => {
        if (node.nodeType === 3) {
          textContent += node.textContent;
        } else if (node.nodeType === 1 && node.tagName.toLowerCase() !== 'a') {
          textContent += node.innerText;
        }
      });
      link.textContent = textContent.trim();
      button.appendChild(link);
      toc.appendChild(button);
    }
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildHeroBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

// export function createLinks(main) {
//   const headings = main.querySelectorAll('.cae h2:not(.hero-container h2)');

//   headings.forEach((heading) => {
//     const headingId = heading.id;
//     heading.setAttribute('id', headingId);

//     // Create a shareable link
//     const shareableLink = document.createElement('a');
//     shareableLink.href = `#${headingId}`;
//     // shareableLink.innerHTML = '🔗';
//     // shareableLink.innerHTML = '#';
//     // shareableLink.style.marginLeft = '10px';
//     // shareableLink.style.marginRight = '20px';

//     // Append the shareable link after the heading
//     heading.insertBefore(shareableLink, heading.firstChild);
//   });
// }

function initializeNavigation() {
  const buttons = document.querySelectorAll('.cae main .toc-container .button-container');

  buttons.forEach((button, index) => {
    button.addEventListener('click', () => {
      buttons.forEach((btn) => {
        btn.classList.remove('active');
      });
      const sections = document.querySelectorAll('.cae main .section');
      sections.forEach((section) => {
        section.classList.remove('active');
      });

      button.classList.add('active');
      const selectedSection = document.querySelector(`.cae main .toc-container ~ .section:nth-child(${index + 3})`);
      if (selectedSection) {
        selectedSection.classList.add('active');
      }
    });
  });

  const firstSection = document.querySelector('.cae main .toc-container ~ .section:nth-child(3)');
  if (firstSection) {
    firstSection.classList.add('active');
  }

  const firstButton = document.querySelector('.cae main .toc-container .button-container');
  if (firstButton) {
    firstButton.classList.add('active');
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  // createLinks(main);
  initializeNavigation();
  buildTocBlock(main);
}

/**
 * loads everything needed to get to LCP.
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    await waitForLCP(LCP_BLOCKS);
  }
}

/**
 * Adds the favicon.
 * @param {string} href The favicon URL
 */
export function addFavIcon(href) {
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/svg+xml';
  link.href = href;
  const existingLink = document.querySelector('head link[rel="icon"]');
  if (existingLink) {
    existingLink.parentElement.replaceChild(link, existingLink);
  } else {
    document.getElementsByTagName('head')[0].appendChild(link);
  }
}

/**
 * loads everything that doesn't need to be delayed.
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  addFavIcon(`${window.hlx.codeBasePath}/styles/favicon.svg`);
  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
}

/**
 * loads everything that happens a lot later, without impacting
 * the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
