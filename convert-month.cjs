const {readFile, writeFile} = require('fs/promises');
const {stringify} = require('yaml');

const month = 'March';
const monthNum = '03';

const basePath = `src/posts/2005/2005-${monthNum}`;

const writeDiaryEntries = async () => {
  let buff = await readFile(`./${month}.md`);
  let text = buff.toString();
  let chunks = text.split('#####################\n');

  chunks.map(async chunk => {
    let lines = chunk.split('\n');

    let [day, ...rest] = lines;

    const twoFigureDay = day.length === 1 ? `0${day}` : day;

    let yaml = getYaml(day, twoFigureDay);

    let content = rest.join('\n');

    const newContent = `---\n${stringify(yaml)}---\n\n${content}`;

    const filepath = `${basePath}-${twoFigureDay}-diary.md`;

    await writeFile(filepath, newContent);

    console.log(`- [x] ${filepath}`);
  });
};

const getYaml = (day, twoFigureDay) => {
  const title = `${day} ${month}`;
  const date = `2005-${monthNum}-${twoFigureDay}`;
  const permalink = `2005/${monthNum}/${twoFigureDay}/diary/`;

  return {title, description: '', date, permalink, author: 'Cindy', comments: [], type: 'Diary'};
};

writeDiaryEntries().catch(console.error);
