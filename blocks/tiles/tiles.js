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

// export default function decorate(block) {
//   const cols = [...block.firstElementChild.children];
//   block.classList.add(`tiles-${cols.length}-cols`);
// }

import { removeOuterElementLayer, combineChildrenToSingleDiv, addInViewAnimationToMultipleElements } from '../../utils/helpers.js';

const ColorIconPattern = ['pink', 'lightgreen', 'purple', 'yellow', 'purple', 'yellow', 'lightgreen', 'pink'];
const ColorNumberPattern = ['lightgreen', 'pink', 'purple', 'yellow'];
const animationConfig = {
  staggerTime: 0.04,
  items: [
    {
      selectors: '.tiles-content-wrapper',
      animatedClass: 'fade-up',
      staggerTime: 0.15,
    },
  ],
};

const getColorPatternIndex = (patternArray, currentIndex) => (currentIndex % patternArray.length);

export default function decorate(block) {
  const classes = ['one', 'two', 'three', 'four', 'five'];
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('enter');
      }
    });
  });

  const row = block.children[0];
  if (row) {
    block.classList.add(classes[row.children.length - 1]);
  }

  block.querySelectorAll(':scope > div > div').forEach((cell, index) => {
    if (!cell.previousElementSibling) cell.classList.add('tiles-left');
    if (!cell.nextElementSibling) cell.classList.add('tiles-right');

    const img = cell.querySelector('img');
    if (img) {
      cell.classList.add('tiles-image');
      observer.observe(img);
      img.parentElement.closest('p').classList.add('image-wrapper-el');
    } else {
      cell.classList.add('tiles-content');
      const wrapper = document.createElement('div');
      wrapper.className = 'tiles-content-wrapper';
      while (cell.firstChild) wrapper.append(cell.firstChild);
      cell.append(wrapper);

      // colored icons
      removeOuterElementLayer(cell, '.icon');
      if (block.classList.contains('colored-icon')) {
        const colorIconPatternIndex = getColorPatternIndex(ColorIconPattern, index);
        cell.querySelector('.icon').classList.add('colored-tag', 'circle', colorIconPatternIndex);
      }
    }

    // colored number tag in cards
    if (block.classList.contains('colored-number')) {
      const colorNumberPatternIndex = getColorPatternIndex(ColorNumberPattern, index);
      cell.querySelector('h4')?.classList.add('colored-tag', 'number-tag', ColorNumberPattern[colorNumberPatternIndex]);
    }
  });

  if (block.classList.contains('single-grid')) {
    combineChildrenToSingleDiv(block);
  }

  if (block.classList.contains('inview-animation')) {
    addInViewAnimationToMultipleElements(animationConfig.items, block, animationConfig.staggerTime);
  }
}
