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
/* eslint-disable no-unused-expressions */
/* global describe it */

import { readFile, setViewport } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';

document.body.innerHTML = await readFile({ path: '../../scripts/dummy.html' });

const { buildBlock, decorateBlock, loadBlock } = await import('../../../scripts/lib-franklin.js');

document.body.innerHTML = await readFile({ path: '../../scripts/body.html' });

const sleep = async (time = 1000) => new Promise((resolve) => {
  setTimeout(() => {
    resolve(true);
  }, time);
});

const headerBlock = buildBlock('header', [['Nav', '/test/blocks/header/nav']]);
document.querySelector('header').append(headerBlock);
decorateBlock(headerBlock);
await loadBlock(headerBlock);
await sleep();

describe('Header block', () => {
  it('Hamburger shows and hides nav', async () => {
    const hamburger = document.querySelector('.header .nav-hamburger');
    const nav = document.querySelector('.header nav');
    expect(hamburger).to.exist;
    expect(nav).to.exist;
    hamburger.click();
    expect(nav.getAttribute('aria-expanded')).to.equal('true');
    hamburger.click();
    expect(nav.getAttribute('aria-expanded')).to.equal('false');
  });

  it('Section title shows and hides section on desktop', async () => {
    await setViewport({ width: 900, height: 640 });
    const sections = document.querySelector('.header .nav-sections');
    const title = sections.querySelector(':scope li');
    title.click();
    expect(title.getAttribute('aria-expanded')).to.equal('true');
    title.click();
    expect(title.getAttribute('aria-expanded')).to.equal('false');
  });
});
