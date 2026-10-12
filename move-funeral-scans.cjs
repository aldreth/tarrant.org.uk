const {readdirSync, renameSync, mkdirSync, existsSync, writeFileSync, rmSync} = require('fs');
const path = require('path');

const cardsSource = 'scanned-images/funeral';
const listSource = 'scanned-images/list-at-funeral';
const cardsTarget = 'src/pages/funeral/cards';
const listTarget = 'src/pages/funeral/list';

const slugify = name => name.toLowerCase().replace(/[^a-z0-9]/g, '');

const moveFolder = (from, to, renameFile = file => file) => {
  mkdirSync(to, {recursive: true});
  for (const file of readdirSync(from)) {
    if (file === '.DS_Store') continue;
    renameSync(path.join(from, file), path.join(to, renameFile(file)));
  }
  rmSync(from, {recursive: true, force: true});
};

const folders = readdirSync(cardsSource, {withFileTypes: true})
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name);

const senders = {};
for (const name of folders) {
  const slug = slugify(name);
  if (senders[slug]) {
    throw new Error(`"${name}" and "${senders[slug]}" both slugify to "${slug}"`);
  }
  if (existsSync(path.join(cardsTarget, slug))) {
    throw new Error(`${path.join(cardsTarget, slug)} already exists`);
  }
  senders[slug] = name;
}

for (const name of folders) {
  const slug = slugify(name);
  moveFolder(path.join(cardsSource, name), path.join(cardsTarget, slug), file =>
    file === 'front.jpg' ? `front-${slug}.jpg` : file
  );
  console.log(`- [x] ${name} -> ${slug}`);
}
rmSync(cardsSource, {recursive: true, force: true});

const sortedSenders = Object.fromEntries(
  Object.entries(senders).sort(([a], [b]) => a.localeCompare(b))
);
writeFileSync(path.join(cardsTarget, 'senders.json'), JSON.stringify(sortedSenders, null, 2) + '\n');

moveFolder(listSource, listTarget);
console.log(`- [x] ${listSource} -> ${listTarget}`);
