// by Chris Burnell: https://chrisburnell.com/article/some-eleventy-filters/#markdown-format

import {readFileSync} from 'node:fs';
import markdownParser from 'markdown-it';

const markdown = markdownParser({html: true});
const bodies = new Map();

const referenceDefs = markdownSource => {
  const defs = new Map();
  const pattern = /^\[([^\]]+)\]:[ \t]+(.+)$/gm;
  for (const match of markdownSource.matchAll(pattern)) {
    let destination = match[2].trim().replace(/\s+".*"$/, '').replace(/^<|>$/g, '');
    if (!destination || destination.includes('...')) continue;
    const id = match[1].toLowerCase();
    if (!defs.has(id)) defs.set(id, destination);
  }
  return defs;
};

const postBody = inputPath => {
  if (!inputPath) return '';
  if (!bodies.has(inputPath)) {
    let raw = '';
    try {
      raw = readFileSync(inputPath, 'utf8');
    } catch {
      raw = '';
    }
    bodies.set(inputPath, raw.replace(/^---[\s\S]*?---\n?/, ''));
  }
  return bodies.get(inputPath);
};

// Excerpts are a cut of the post, so reference links and tags are often unfinished.
const prepareExcerpt = (excerpt, inputPath) => {
  const defs = referenceDefs(postBody(inputPath));
  for (const [id, destination] of referenceDefs(excerpt)) {
    if (!defs.has(id)) defs.set(id, destination);
  }
  let text = excerpt;
  text = text.replace(/<wpg2>[\s\S]*?(?:<\/wpg2>|$)/gi, '');
  text = text.replace(/<!--[\s\S]*?(?:-->|$)/g, '');
  text = text.replace(/!\[[^\]]*\]\([^)]*\)?/g, '');
  text = text.replace(/\{:[^}\n]*\}?/g, '');
  text = text.replace(/\[([^\]]+)\]\[([^\]]+)\]/g, (match, label, id) => {
    const url = defs.get(id.toLowerCase());
    if (!url) return label;
    const href = /[\s()]/.test(url) ? `<${url}>` : url;
    return `[${label}](${href})`;
  });
  text = text.replace(/[ \t]*\[[^\]]+\]:[ \t]+.*$/gm, '');
  return text.replace(/[ \t]{2,}/g, ' ').trim();
};

const keepSnippetTags = html =>
  html.replace(/<\/?([a-zA-Z0-9]+)(\s[^>]*)?\s*\/?>/g, (match, tag) => {
    const name = tag.toLowerCase();
    if (['p', 'a', 'strong', 'em', 'sup', 'sub', 'br', 'code'].includes(name)) return match;
    return '';
  });

export const markdownFormat = (string, inputPath) => {
  if (!string) return '';
  const prepared = prepareExcerpt(String(string), inputPath);
  if (!prepared) return '';
  return keepSnippetTags(markdown.render(prepared));
};
