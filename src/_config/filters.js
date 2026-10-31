import {toISOString, formatDate} from './filters/dates.js';
import {markdownFormat} from './filters/markdown-format.js';
import {shuffleArray} from './filters/sort-random.js';
import {sortAlphabetically} from './filters/sort-alphabetic.js';
import {splitlines} from './filters/splitlines.js';
import {commentParagraphs, decodeText} from './filters/comment-text.js';
import {striptags} from './filters/striptags.js';
import {slugifyString} from './filters/slugify.js';
import {gallerySlug} from './galleries.js';
import {postPermalink} from './filters/post-permalink.js';
import {getYear, getMonth, getDay} from './filters/date-part-handling.js';

// Front matter stores ./src/posts/.../photo.jpg. The published file is /posts/.../photo.jpg.
const originalUrl = src => `/${String(src).replace(/^\.\//, '').replace(/^src\//, '').replace(/^\//, '')}`;

export default {
  toISOString,
  formatDate,
  markdownFormat,
  splitlines,
  commentParagraphs,
  decodeText,
  striptags,
  shuffleArray,
  sortAlphabetically,
  slugifyString,
  gallerySlug,
  postPermalink,
  getYear,
  getMonth,
  getDay,
  originalUrl
};
