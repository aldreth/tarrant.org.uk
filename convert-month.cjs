const {readFile, writeFile} = require('fs/promises');
const {stringify} = require('yaml');

const month = 'February';
const monthNum = '02';

const basePath = `src/posts/2005/2005-${monthNum}`;

const writeDiaryEntries = async () => {
  let buff = await readFile(`./${month}.md`);
  let text = buff.toString();
  let chunks = text.split('#####################\n');

  chunks.map(async chunk => {
    let lines = chunk.split('\n');

    let [day, ...rest] = lines;
    let yaml = getYaml(day);

    let content = rest.join('\n');

    const newContent = `---\n${stringify(yaml)}---\n\n${content}`;

    day = day.length === 1 ? `0${day}` : day;
    const filepath = `${basePath}-${day}-diary.md`;

    await writeFile(filepath, newContent);

    console.log(`- [x] ${filepath}`);
  });
};

const getYaml = day => {
  const title = `${day} ${month}`;
  const date = `2005-${monthNum}-${day}`;
  const permalink = `2005/${monthNum}/${day}/diary/`;

  return {title, date, permalink, author: 'Cindy', comments: [], type: 'Diary'};
};

writeDiaryEntries().catch(console.error);
