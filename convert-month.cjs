const {readFile, writeFile} = require('fs/promises');
const {stringify} = require('yaml');

const basePath = `src/posts/`;

const writeDiaryEntries = async () => {
  let buff = await readFile(`./journal/journal.md`);
  let text = buff.toString();
  let chunks = text.split('#####################\n');

  chunks.map(async chunk => {
    let lines = chunk.split('\n');

    let [date, ...rest] = lines;

    let year = new Date(date).getFullYear();

    let yaml = getYaml(date);

    let content = rest.join('\n');

    const newContent = `---\n${stringify(yaml)}---\n\n${content}`;

    const filepath = `${basePath}${year}/${date}-journal.md`;

    await writeFile(filepath, newContent);

    console.log(`- [x] ${filepath}`);
  });
};

const getYaml = date => {
  let options = {day: 'numeric', month: 'long'};
  const title = new Intl.DateTimeFormat('en-GB', options).format(new Date(date));
  const slashDate = date.replaceAll('-', '/');
  const permalink = `${slashDate}/journal/`;

  return {title, description: '', date, permalink, author: 'Cindy', comments: [], type: 'Journal'};
};

writeDiaryEntries().catch(console.error);
