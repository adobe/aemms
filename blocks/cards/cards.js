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

import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import { cropString } from '../../scripts/scripts.js';

export default function decorate(block) {
  const isHero = block.classList.contains('hero-block');
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.innerHTML = row.innerHTML;

    const addCardChildrenClasses = (div) => {
      if (div.children.length === 1 && (div.querySelector(':scope>picture') || div.querySelector(':scope>.icon'))) {
        div.className = 'cards-card-image';
      } else {
        div.className = 'cards-card-body';
      }
    };

    // find the first <a> deep in the <li>
    const a = li.querySelector('a');

    if (a && !block.classList.contains('nolink')) {
      const aContent = a.innerHTML;
      const cardTitleDiv = document.createElement('div');
      cardTitleDiv.innerHTML = aContent;
      a.replaceWith(cardTitleDiv);
      a.innerHTML = '';
      a.append(...li.children);
      li.append(a);
      console.log(li);
      [...a.children].forEach(addCardChildrenClasses);
    } else {
      [...li.children].forEach(addCardChildrenClasses);
    }

    const title = li.querySelector('.title');
    if (title) {
      [title.textContent] = title.textContent.split('|');
      title.textContent = cropString(title.textContent, 65);
    }
    ul.append(li);
  });
  ul.querySelectorAll('img')
    .forEach((img) => img.closest('picture')
      .replaceWith(createOptimizedPicture(img.src, img.alt, isHero, [{ width: '750' }])));
  if (ul.querySelector('a') === null && !block.classList.contains('omit-nolink-styles') && block.closest('.section.cards-container')) {
    block.closest('.section.cards-container').classList.add('nolink');
  }
  block.textContent = '';
  block.append(ul);
}
