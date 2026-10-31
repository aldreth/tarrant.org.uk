import path from 'node:path';
import {slugifyString} from './filters/slugify.js';

// Loose files in these folders are not an album name. The slug then comes from the filenames.
const genericDirs = new Set(['assets', 'src', 'posts', 'pages']);

const isGallery = value =>
  Array.isArray(value) && value.length > 1 && value.every(item => item && typeof item.image === 'string');

/** Album folder, or the shared start of the filenames when the photos are not in their own folder. */
export const gallerySlug = images => {
  const dirs = images.map(item => path.basename(path.dirname(item.image)));
  const counts = new Map();
  for (const dir of dirs) counts.set(dir, (counts.get(dir) || 0) + 1);
  const [topDir, topCount] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];

  if (!genericDirs.has(topDir) && topCount * 2 >= images.length) return slugifyString(topDir);

  const names = images.map(item => path.basename(item.image, path.extname(item.image)));
  let prefix = names[0];
  for (const name of names) {
    while (prefix && !name.startsWith(prefix)) prefix = prefix.slice(0, -1);
  }
  prefix = prefix.replace(/[-_]+$/, '');
  return slugifyString(prefix.length >= 3 ? prefix : names[0]);
};

const sharedAlt = images => {
  const alts = [...new Set(images.map(image => (image.alt || '').trim()).filter(Boolean))];
  return alts.length === 1 ? alts[0] : null;
};

// These section indexes keep their galleries on the page.
const staysOnPage = new Set(['/blog/', '/diary/', '/journal/']);

const byDate = (a, b) => {
  if (a.date && b.date && a.date.getTime() !== b.date.getTime()) return a.date - b.date;
  if (a.date && !b.date) return -1;
  if (!a.date && b.date) return 1;
  return a.title.localeCompare(b.title, 'en');
};

// One label for the album. A post that only holds this gallery wins. Otherwise a shared alt that is not just the post title (Bruges, Wales).
const choose = sources => {
  const dedicated = sources.filter(source => source.galleryCount === 1);
  for (const source of dedicated) {
    const alt = sharedAlt(source.images);
    if (alt) return {title: alt, images: source.images};
  }
  if (dedicated.length) return {title: dedicated[0].title, images: dedicated[0].images};

  for (const source of sources) {
    const alt = sharedAlt(source.images);
    if (alt && alt !== source.title) return {title: alt, images: source.images};
  }
  return {title: sources[0].title, images: sources[0].images};
};

/** One entry per album. The same photos on two posts share one gallery page. */
export const getGalleries = collection => {
  const items = [
    ...collection.getFilteredByGlob('./src/posts/**/*.md'),
    ...collection.getFilteredByGlob('./src/pages/**/*.{md,njk}')
  ];

  const groups = new Map();

  for (const item of items) {
    if (!item.url || staysOnPage.has(item.url)) continue;
    const galleries = Object.values(item.data).filter(isGallery);
    for (const images of galleries) {
      const id = images
        .map(image => image.image)
        .sort()
        .join('\0');
      if (!groups.has(id)) groups.set(id, []);
      groups.get(id).push({
        title: item.data.title,
        galleryTitle: item.data.galleryTitle,
        url: item.url,
        date: item.data.date ? item.date : null,
        images,
        galleryCount: galleries.length
      });
    }
  }

  const galleries = [];
  const slugs = new Set();

  for (const sources of groups.values()) {
    sources.sort(byDate);
    const chosen = choose(sources);
    const slug = gallerySlug(chosen.images);
    if (slugs.has(slug)) throw new Error(`Two different galleries share the slug ${slug}`);
    slugs.add(slug);
    const galleryTitle = sources.map(source => source.galleryTitle).find(Boolean);

    galleries.push({
      slug,
      title: galleryTitle || chosen.title,
      images: chosen.images,
      posts: sources.map(({title, url, date}) => ({title, url, date})),
      date: sources.find(source => source.date)?.date || null
    });
  }

  galleries.sort((a, b) => {
    if (a.date && b.date && a.date.getTime() !== b.date.getTime()) return b.date - a.date;
    if (a.date && !b.date) return -1;
    if (!a.date && b.date) return 1;
    return a.title.localeCompare(b.title, 'en');
  });

  return galleries;
};
