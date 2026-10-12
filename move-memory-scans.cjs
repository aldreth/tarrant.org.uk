const {readdirSync, renameSync, mkdirSync, existsSync, writeFileSync, rmSync} = require('fs');
const path = require('path');

const source = 'scanned-images/memories';
const target = 'src/pages/memories/letters';

const slugify = name => name.toLowerCase().replace(/[^a-z0-9]/g, '');

// output images are named by basename only, so non-numeric names must be made unique
const renameFile = slug => file => {
  const {name, ext} = path.parse(file);
  if (/^\d+$/.test(name)) return file;
  if (name === 'front') return `front-${slug}${ext}`;
  return `${slug}-${name}${ext}`;
};

const folders = readdirSync(source, {withFileTypes: true})
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name);

const senders = {};
for (const name of folders) {
  const slug = slugify(name);
  if (senders[slug]) {
    throw new Error(`"${name}" and "${senders[slug]}" both slugify to "${slug}"`);
  }
  if (existsSync(path.join(target, slug))) {
    throw new Error(`${path.join(target, slug)} already exists`);
  }
  senders[slug] = name;
}

for (const name of folders) {
  const slug = slugify(name);
  const from = path.join(source, name);
  const to = path.join(target, slug);
  mkdirSync(to, {recursive: true});
  for (const file of readdirSync(from)) {
    if (file === '.DS_Store') continue;
    renameSync(path.join(from, file), path.join(to, renameFile(slug)(file)));
  }
  rmSync(from, {recursive: true, force: true});
  console.log(`- [x] ${name} -> ${slug}`);
}
rmSync(source, {recursive: true, force: true});

const sortedSenders = Object.fromEntries(
  Object.entries(senders).sort(([a], [b]) => a.localeCompare(b))
);
writeFileSync(path.join(target, 'senders.json'), JSON.stringify(sortedSenders, null, 2) + '\n');
