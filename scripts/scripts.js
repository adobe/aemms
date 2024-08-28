/* eslint-disable no-console */
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
  createOptimizedPicture,
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

// Function to get the current window size
export function getWindowSize() {
  const windowWidth = window.innerWidth
    || document.documentElement.clientWidth
    || document.body.clientWidth;
  const windowHeight = window.innerHeight
    || document.documentElement.clientHeight
    || document.body.clientHeight;
  return {
    width: windowWidth,
    height: windowHeight,
  };
}

export function getViewPort() {
  const { width } = getWindowSize();
  if (width >= 900) {
    return 'desktop';
  }
  return 'mobile';
}

function decorateSectionsWithBackgrounds(element) {
  const sections = element.querySelectorAll(`.section[data-bg-image],
  .section[data-bg-image-desktop],
  .section[data-bg-image-mobile],
  .section[data-bg-image-tablet]`);
  sections.forEach((section) => {
    const bgImage = section.getAttribute('data-bg-image');
    const bgImageDesktop = section.getAttribute('data-bg-image-desktop');
    const bgImageMobile = section.getAttribute('data-bg-image-mobile');
    const bgImageTablet = section.getAttribute('data-bg-image-tablet');
    const viewPort = getViewPort();
    let background;
    switch (viewPort) {
      case 'Mobile':
        background = bgImageMobile || bgImageTablet || bgImageDesktop || bgImage;
        break;
      case 'Tablet':
        background = bgImageTablet || bgImageDesktop || bgImage || bgImageMobile;
        break;
      default:
        background = bgImageDesktop || bgImage || bgImageTablet || bgImageMobile;
        break;
    }
    if (background) {
      if (section.classList.contains('with-static-background-image')) {
        section.classList.add('with-static-background-image');
      } else {
        section.classList.add('with-background-image');
      }
      const backgroundPic = createOptimizedPicture(background);
      backgroundPic.classList.add('background-image');
      section.append(backgroundPic);
    }
  });
}

/**
 * load fonts.css and set a session storage flag
 */
// async function loadFonts() {
//   await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
//   try {
// eslint-disable-next-line max-len
//     if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
//   } catch (e) {
//     // do nothing
//   }
// }

async function buildTocBlock(main) {
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
  const buttons = document.querySelectorAll('.toc-layout main .toc-container .button-container');

  buttons.forEach((button, index) => {
    button.addEventListener('click', () => {
      buttons.forEach((btn) => {
        btn.classList.remove('active');
      });
      const sections = document.querySelectorAll('.toc-layout main .section');
      sections.forEach((section) => {
        section.classList.remove('active');
      });

      button.classList.add('active');
      const selectedSection = document.querySelector(`.toc-layout main .toc-container ~ .section:nth-child(${index + 3})`);
      if (selectedSection) {
        selectedSection.classList.add('active');
      }
    });
  });

  const firstSection = document.querySelector('.toc-layout main .toc-container ~ .section:nth-child(3)');
  if (firstSection) {
    firstSection.classList.add('active');
  }

  const firstButton = document.querySelector('.toc-layout main .toc-container .button-container');
  if (firstButton) {
    firstButton.classList.add('active');
  }
}

export function decorateExternalLinks(main) {
  main.querySelectorAll('a').forEach((a) => {
    const isExternalLink = !a.getAttribute('href')?.startsWith('/');
    if (isExternalLink) a.setAttribute('target', '_blank');
  });
}

export function highlightText(element) {
  element.querySelectorAll('li, p').forEach((el) => {
    const content = el.innerHTML;
    const pattern = /\[([a-zA-Z-]+)\]([\s\S]*?)\[\1\]/g;
    const processedContent = content.replace(pattern, '<span class="$1">$2</span>');
    el.innerHTML = processedContent;
  });
}

function replacePlaceholders(BPOData) {
  let bodyText = document.body.innerHTML;
  const placeholderText = bodyText.match(/\{[^}]+\}/g);

  if (!placeholderText) {
    console.log('No placeholders found.');
    return;
  }

  placeholderText.forEach((placeholder) => {
    const placeholderName = placeholder.slice(1, -1);
    const dataObject = BPOData.find((item) => item.Key === placeholderName);

    if (dataObject) {
      bodyText = bodyText.replace(new RegExp(`\\{${placeholderName}\\}`, 'g'), dataObject.Text);
    } else {
      // eslint-disable-next-line no-console
      console.log('Value not found in BPOData:', placeholderName);
    }
  });
  document.body.innerHTML = bodyText;

  // console.log('Placeholders replaced successfully.');
}

export function loadBPOData() {
  window.siteindex = window.siteindex || { data: [], loaded: false };
  fetch('/hackathon-2024/placeholders.json')
    .then((response) => response.json())
    .then((responseJson) => {
      window.siteindex.data = responseJson?.data;
      if (window.siteindex && window.siteindex.loaded) {
        replacePlaceholders(window.siteindex.data);
      } else {
        document.addEventListener('dataset-ready', () => {
          replacePlaceholders(window.siteindex.data);
        });
      }
      window.siteindex.loaded = true;
      const event = new Event('dataset-ready');
      document.dispatchEvent(event);
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.log(`Error loading placeholders: ${error.message}`);
    });
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
  decorateSectionsWithBackgrounds(main);
  // createLinks(main);
  initializeNavigation();
  buildTocBlock(main);
  decorateExternalLinks(main);
  highlightText(main);
  loadBPOData();
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
    document.body.classList.add('appear');
    await waitForLCP(LCP_BLOCKS);
  }

  // try {
  //   /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
  //   if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
  //     loadFonts();
  //   }
  // } catch (e) {
  //   // do nothing
  // }
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

export function getYoutubeVideoId(url) {
  if (url.includes('youtube.com/watch?v=')) {
    return new URL(url).searchParams.get('v');
  }
  if (url.includes('youtube.com/embed/') || url.includes('youtu.be/')) {
    return new URL(url).pathname.split('/').pop();
  }
  return null;
}

export function cropString(inputString, maxLength) {
  if (inputString.length <= maxLength) {
    return inputString;
  }

  const words = inputString.split(/\s+/); // Split the string into words
  let croppedString = '';
  let currentLength = 0;

  words.every((word) => {
    if (currentLength + word.length + 1 <= maxLength) {
      // Add the word and a space if it doesn't exceed the maxLength
      croppedString += `${word} `;
      currentLength += word.length + 1;
      return true;
    }
    // Otherwise, stop the loop
    return false;
  });

  // Remove trailing space and add an ellipsis if needed
  croppedString = croppedString.trim();
  if (croppedString.length < inputString.length) {
    croppedString += '...';
  }

  return croppedString;
}

export async function loadScript(url, attrs = {}) {
  const script = document.createElement('script');
  script.src = url;
  // eslint-disable-next-line no-restricted-syntax
  for (const [name, value] of Object.entries(attrs)) {
    script.setAttribute(name, value);
  }
  const loadingPromise = new Promise((resolve, reject) => {
    script.onload = resolve;
    script.onerror = reject;
  });
  document.head.append(script);
  return loadingPromise;
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
