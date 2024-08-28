/* eslint-disable no-console */
function processChildDiv(selector, block) {
  const childDiv = block.querySelector(selector);
  childDiv.classList.add('icon-style');
  if (childDiv) {
    const iconPTags = childDiv.querySelectorAll('p');
    const strongIconPTags = [];
    let spanIconPTag = null;

    iconPTags.forEach((pTag) => {
      if (pTag.querySelector('strong span.icon')) {
        strongIconPTags.push(pTag);
      }
      if (pTag.querySelector('span.icon') && !pTag.querySelector('strong span.icon')) {
        spanIconPTag = pTag;
      }
    });
    // Create the flex wrapper div
    const flexWrapperDiv = document.createElement('div');
    flexWrapperDiv.classList.add('flex');
    flexWrapperDiv.appendChild(strongIconPTags[0]);
    flexWrapperDiv.appendChild(strongIconPTags[1]);
    flexWrapperDiv.appendChild(spanIconPTag);
    childDiv.appendChild(flexWrapperDiv);

    // Create the category div
    const categoryDiv = document.createElement('div');
    categoryDiv.classList.add('category');

    // Append the span icon p tag and the flex div to the category div
    if (spanIconPTag) {
      categoryDiv.appendChild(spanIconPTag);
    }
    categoryDiv.appendChild(flexWrapperDiv);

    const firstPTag = childDiv.querySelector('p');

    // Insert the categoryDiv after the first p tag
    if (firstPTag) {
      firstPTag.insertAdjacentElement('afterend', categoryDiv);
    }
  }
}

export default async function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`bpo-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('bpo-img-col');
        }
      }

      // Check for p > em and wrap in a div
      const pWithEm = col.querySelector('p > em');
      if (pWithEm) {
        const pTag = pWithEm.closest('p');
        const wrapperDiv = document.createElement('div');
        pTag.parentNode.insertBefore(wrapperDiv, pTag);
        wrapperDiv.appendChild(pTag);
      }

      // Check for p with picture and strong tags and apply flex
      const pTags = col.querySelectorAll('p');
      pTags.forEach((pTag) => {
        const hasPicture = pTag.querySelector('picture');
        const hasStrong = pTag.querySelector('strong');
        if (hasPicture && hasStrong) {
          pTag.style.display = 'flex';
          pTag.classList.add('align');
        }
      });

      const alignPTags = col.querySelectorAll('p.align');
      if (alignPTags.length > 0) {
        const alignWrapperDiv = document.createElement('div');
        alignPTags.forEach((pTag) => {
          pTag.parentNode.insertBefore(alignWrapperDiv, pTag);
          alignWrapperDiv.appendChild(pTag);
        });

        // Find the p tag with the picture tag
        const pWithPicture = col.querySelector('p picture').closest('p');
        if (pWithPicture) {
          const topWrapperDiv = document.createElement('div');
          pWithPicture.parentNode.insertBefore(topWrapperDiv, pWithPicture);
          topWrapperDiv.appendChild(pWithPicture);
          topWrapperDiv.appendChild(alignWrapperDiv);
          topWrapperDiv.classList.add('top');
        }
      }
    });
  });

  processChildDiv('div:nth-child(4) > div:nth-child(2)', block);
  processChildDiv('div:nth-child(4) > div:nth-child(3)', block);
}
