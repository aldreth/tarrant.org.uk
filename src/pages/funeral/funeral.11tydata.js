import {readdirSync, readFileSync, existsSync} from 'node:fs';
import path from 'node:path';

const funeralDir = './src/pages/funeral';
const cardsDir = `${funeralDir}/cards`;
const listDir = `${funeralDir}/list`;

const noText = '[no legible text]';

const readText = file => {
  if (!existsSync(file)) return '';
  const text = readFileSync(file, 'utf8').trim();
  return text === noText ? '' : text;
};

const jpgsIn = dir =>
  readdirSync(dir)
    .filter(file => file.endsWith('.jpg'))
    .sort((a, b) => {
      const aFront = a.startsWith('front-');
      const bFront = b.startsWith('front-');
      if (aFront !== bFront) return aFront ? -1 : 1;
      return a.localeCompare(b, undefined, {numeric: true});
    });

const listGallery = jpgsIn(listDir).map((file, index) => ({
  images: [
    {
      src: `${listDir}/${file}`,
      alt: `Page ${index + 1} of the list of names at the funeral`,
      caption: `Page ${index + 1}`
    }
  ],
  text: readText(`${listDir}/${path.basename(file, '.jpg')}.txt`)
}));

const senders = JSON.parse(readFileSync(`${cardsDir}/senders.json`, 'utf8'));

const cardsFrom = (slug, sender) => {
  const dir = `${cardsDir}/${slug}`;
  const cards = [];
  let images = [];

  for (const file of jpgsIn(dir)) {
    images.push(`${dir}/${file}`);
    const txt = `${dir}/${path.basename(file, '.jpg')}.txt`;
    if (existsSync(txt)) {
      cards.push({images, text: readText(txt)});
      images = [];
    }
  }
  if (images.length) {
    if (cards.length) cards.at(-1).images.push(...images);
    else cards.push({images, text: ''});
  }

  return cards.map(card => ({
    images: card.images.map((src, index) =>
      index === 0
        ? {src, alt: `Front of the card from ${sender}`, caption: sender}
        : {src, alt: 'Inside of the card'}
    ),
    text: card.text
  }));
};

const cardsGallery = Object.keys(senders)
  .sort((a, b) => a.localeCompare(b))
  .flatMap(slug => cardsFrom(slug, senders[slug]));

export default {listGallery, cardsGallery};
