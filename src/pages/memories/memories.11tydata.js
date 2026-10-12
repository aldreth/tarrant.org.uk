import {readdirSync, readFileSync, existsSync} from 'node:fs';
import path from 'node:path';

const lettersDir = './src/pages/memories/letters';

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

const senders = JSON.parse(readFileSync(`${lettersDir}/senders.json`, 'utf8'));

const memoryFrom = slug => {
  const sender = senders[slug];
  const dir = `${lettersDir}/${slug}`;
  const pages = jpgsIn(dir).map((file, index) => ({
    src: `${dir}/${file}`,
    alt: index === 0 ? `The first page of the memories from ${sender}` : `Page ${index + 1} of the memories from ${sender}`,
    text: readText(`${dir}/${path.basename(file, '.jpg')}.txt`)
  }));
  return {caption: sender, pages};
};

const memoriesGallery = Object.keys(senders)
  .sort((a, b) => a.localeCompare(b))
  .map(memoryFrom);

export default {memoriesGallery};
