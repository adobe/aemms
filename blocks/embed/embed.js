/*
 * Embed Block
 * Show videos and social posts directly on your page
 * https://www.hlx.live/developer/block-collection/embed
 */

import { loadScript } from '../../scripts/scripts.js';
import { loadCSS } from '../../scripts/lib-franklin.js';

const embedYoutube = (url, isLite) => {
  const usp = new URLSearchParams(url.search);
  let suffix = '';
  let vid = usp.get('v');
  const autoplayParam = usp.get('autoplay');
  const mutedParam = usp.get('muted');

  if (autoplayParam && mutedParam) {
    suffix += `&autoplay=${autoplayParam}&muted=${mutedParam}`;
  } else if (autoplayParam) {
    suffix += `&autoplay=${autoplayParam}&muted=1`;
  } else if (mutedParam) {
    suffix += `&muted=${mutedParam}`;
  }

  let embed = url.pathname;
  if (url.origin.includes('youtu.be')) {
    [, vid] = url.pathname.split('/');
  }

  let embedHTML;

  if (isLite) {
    const embedSplit = embed.split('/');
    embedHTML = `
      <lite-youtube videoid=${vid || embedSplit[embedSplit.length - 1]}>
        <a href="https://www.youtube.com${vid ? `/embed/${vid}?rel=0&v=${vid}${suffix}` : embed}" class="lty-playbtn" title="Play Video">
      </a>
      </lite-youtube>`;
    loadCSS(`${window.hlx.codeBasePath}/blocks/embed/lite-yt-embed.css`);
    loadScript(`${window.hlx.codeBasePath}/blocks/embed/lite-yt-embed.js`);
  } else {
    if (usp.get('list')) {
      // Special handling to support urls like "https://www.youtube.com/embed/videoseries?list=PL5uLvIsyvVSkGAGW3nW4pe3nfwQQRlMvD"
      embed += url.search;
    }
    embedHTML = `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
        <iframe src="https://www.youtube.com${vid ? `/embed/${vid}?rel=0&v=${vid}${suffix}` : embed}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" 
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope; picture-in-picture" scrolling="no" title="Content from Youtube" loading="lazy"></iframe>
      </div>`;
  }

  return embedHTML;
};

/**
* Facebook, twitter social plugins embedding
* @param {*} urlParam
* @param {*} type
* @returns
*/
const embedSocialPlugins = (urlParam, isLite, type) => {
  const url = urlParam;
  const usp = new URLSearchParams(decodeURI(urlParam));
  let width = usp.get('container_width') || usp.get('width') || '360px';
  let height = usp.get('height') || usp.get('maxHeight') || '598px';

  if (width.indexOf('px') === -1) {
    width += 'px';
  }
  if (height.indexOf('px') === -1) {
    height += 'px';
  }

  const embedHTML = `<div class='social-plugin ${type}' style="width:${width};">
    <iframe class='social-plugin-iframe' src=${url} loading="lazy" style="width:${width}; height:${height};"
      title="${type}:post ${type} Social Plugin" frameborder="0" allowtransparency="true" scrolling="no" allow="encrypted-media" allowfullscreen="true"></iframe>
  </div>`;

  return embedHTML;
};

const loadEmbed = (block, grandChilds, link) => {
  if (block.classList.contains('embed-is-loaded')) {
    return;
  }

  const EMBEDS_CONFIG = [
    {
      match: ['youtube', 'youtu.be'],
      embed: embedYoutube,
    },
    {
      match: ['facebook', 'fb'],
      embed: embedSocialPlugins,
      type: 'facebook',
    },
    {
      match: ['twitter'],
      embed: embedSocialPlugins,
      type: 'twitter',
    },
    {
      match: ['instagram'],
      embed: embedSocialPlugins,
      type: 'instagram',
    },
  ];

  const config = EMBEDS_CONFIG.find((e) => e.match.some((match) => link.includes(match)));
  const url = new URL(link);
  const isLite = block.classList.contains('lite');

  if (config) {
    const shareVariant = block.classList.contains('share');
    block.innerHTML = config.embed(url, isLite, config.type);
    block.classList = `block embed embed-${config.match[0]} ${shareVariant ? 'share' : ''}`;
  }
  block.classList.add('embed-is-loaded');

  if (grandChilds.length === 2) {
    // This handles video with caption
    const captionDiv = grandChilds[1];
    captionDiv.classList.add('caption');
    block.appendChild(captionDiv);
  }
};

export default function decorate(block) {
  const link = block.querySelector('a').href;
  const childDiv = block.querySelector('div');
  const grandChilds = childDiv ? childDiv.querySelectorAll('div') : [];
  block.textContent = '';

  if (block.closest('body')) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        loadEmbed(block, grandChilds, link);
      }
    });
    observer.observe(block);
  } else {
    loadEmbed(block, grandChilds, link);
  }
}