// @ts-check
const {readdir, readFile, writeFile} = require('fs/promises');
const matter = require('gray-matter');
const {stringify} = require('yaml');
const slugify = require('slugify');

const directory = './all-posts/2009';

const postPermalink = (date, title) => {
  const year = date.substring(0, 4);
  const month = date.substring(5, 7);
  const day = date.substring(8, 10);
  const slug = slugify(title, {
    replacement: '-',
    remove: /[#,&,+()$~%.'":*¿?¡!<>{}]/g,
    lower: true
  });

  const permalink = `${year}/${month}/${day}/${slug}/`;

  console.log('***********', permalink);
  return permalink;
};

async function updateFrontMatter(filename) {
  const filepath = `${directory}/${filename}`;
  const {data: frontMatter, content} = matter(await readFile(filepath));

  let {date, title, tags, categories, description, comments, author} = frontMatter;
  const parsedDate = new Date(date);
  const stringDate = parsedDate.toISOString().substring(0, 10);

  title = title ?? '';
  description = description ?? '';
  tags = tags ?? [];
  categories = categories ?? [];
  comments = comments ?? [];

  tags = tags.concat(categories);
  tags = new Set(tags);
  tags = Array.from(tags);

  // author = author?.display_name ?? 'unknown';

  const permalink = postPermalink(stringDate, title);

  const newFrontMatter = {title, description, date: stringDate, permalink, tags, author, comments};

  console.log(newFrontMatter);

  const newContent = `---\n${stringify(newFrontMatter)}---\n${content}`;

  await writeFile(filepath, newContent);

  console.log(`- [x] ${filepath}`);
}

async function main() {
  const filenames = await readdir(directory);
  const markdownFilenames = filenames.filter(f => f.endsWith('.md'));

  await Promise.all(markdownFilenames.map(updateFrontMatter));
}

main().catch(console.error);
