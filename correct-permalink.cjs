const {readFile, writeFile} = require('fs/promises');
const {stringify} = require('yaml');
const {glob} = require('glob');
const matter = require('gray-matter');

const basePath = `src/posts/`;

const writeDiaryEntries = async () => {
  const files = await glob('src/posts/**/*.md');

  files.map(async file => {
    const md = matter.read(file);
    md.data.date = md.data.date.toISOString().substring(0, 10);
    md.data.description =
      md.content
        .replaceAll('\n', ' ')
        .replaceAll('#', '')
        .split(' ')
        .filter(w => w != '')
        .slice(0, 20)
        .join(' ') + '...';

    if (!md.data.permalink.startsWith('/')) {
      md.data.permalink = `/${md.data.permalink}`;
    }
    const newContent = md.stringify();

    await writeFile(file, newContent);
    console.log(`- [x] ${file}`);
  });
};

writeDiaryEntries().catch(console.error);
