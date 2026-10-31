import Image from '@11ty/eleventy-img';
import {readdir, rm} from 'node:fs/promises';
import path from 'node:path';

const outputDir = './dist/assets/images/';

const stringifyAttributes = attributeMap => {
  return Object.entries(attributeMap)
    .map(([attribute, value]) => {
      if (typeof value === 'undefined') return '';
      const escaped = String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;');
      return `${attribute}="${escaped}"`;
    })
    .join(' ');
};

// eleventy-img mutates its shared default options, so its own in-memory cache misses on repeat calls
const imageCache = new Map();

const processImage = (src, widths, formats) => {
  const key = JSON.stringify([src, widths, formats]);
  if (!imageCache.has(key)) {
    imageCache.set(
      key,
      Image(src, {
        widths: [...widths],
        formats: [...formats],
        urlPath: '/assets/images/',
        outputDir,
        filenameFormat: (id, src, width, format, options) => {
          const extension = path.extname(src);
          const name = path.basename(src, extension);
          return `${name}-${id}-${width}w.${format}`;
        }
      })
    );
  }
  return imageCache.get(key);
};

// dist/assets/images survives `npm run clean` and is cached on Netlify, so renditions of changed or removed images would otherwise still be deployed
export const pruneUnusedImages = async () => {
  const used = new Set();
  for (const metadata of await Promise.all(imageCache.values())) {
    for (const entry of Object.values(metadata).flat()) {
      used.add(path.basename(entry.outputPath));
    }
  }
  const files = await readdir(outputDir, {withFileTypes: true});
  const unused = files.filter(file => file.isFile() && !used.has(file.name));
  await Promise.all(unused.map(file => rm(path.join(outputDir, file.name))));
  if (unused.length) console.log(`[image] Removed ${unused.length} unused images`);
};

export const imageShortcode = async (
  src,
  alt = '',
  caption = '',
  loading = 'lazy',
  containerClass,
  imageClass,
  widths = [650, 960, 1400],
  sizes = 'auto',
  formats = ['webp', 'jpeg']
) => {
  // Prepend "./src" if not present
  if (!src.startsWith('./src')) {
    src = `./src${src}`;
  }

  const metadata = await processImage(src, widths, formats);

  const lowsrc = metadata.jpeg[metadata.jpeg.length - 1];

  const imageSources = Object.values(metadata)
    .map(imageFormat => {
      return `  <source type="${imageFormat[0].sourceType}" srcset="${imageFormat
        .map(entry => entry.srcset)
        .join(', ')}" sizes="${sizes}">`;
    })
    .join('\n');

  const imageAttributes = stringifyAttributes({
    'src': lowsrc.url,
    'width': lowsrc.width,
    'height': lowsrc.height,
    alt,
    loading,
    'decoding': loading === 'eager' ? 'sync' : 'async',
    ...(imageClass && {class: imageClass}),
    'eleventy:ignore': ''
  });

  const pictureElement = `<picture> ${imageSources}<img ${imageAttributes}></picture>`;

  return caption
    ? `<figure slot="image"${containerClass ? ` class="${containerClass}"` : ''}>${pictureElement}<figcaption>${caption}</figcaption></figure>`
    : `<picture slot="image"${containerClass ? ` class="${containerClass}"` : ''}>${imageSources}<img ${imageAttributes}></picture>`;
};

// 480px covers a gallery-grid cell (about 10–12rem) at 2x. 800px covers the larger index cells and the 24rem post covers.
const thumbWidths = [480, 800];
const thumbSizes = '(min-width: 70em) 16rem, (min-width: 40em) 30vw, 46vw';

export const imageThumbShortcode = async (src, alt = '', caption = '', sizes = thumbSizes) =>
  imageShortcode(src, alt, caption, 'lazy', undefined, undefined, thumbWidths, sizes);
