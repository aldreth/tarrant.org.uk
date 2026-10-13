import {toISOString, formatDate} from './filters/dates.js';
import {markdownFormat} from './filters/markdown-format.js';
import {shuffleArray} from './filters/sort-random.js';
import {sortAlphabetically} from './filters/sort-alphabetic.js';
import {splitlines} from './filters/splitlines.js';
import {commentParagraphs, decodeText} from './filters/comment-text.js';
import {striptags} from './filters/striptags.js';
import {slugifyString} from './filters/slugify.js';
import {postPermalink} from './filters/post-permalink.js';
import {getYear, getMonth, getDay} from './filters/date-part-handling.js';

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
  postPermalink,
  getYear,
  getMonth,
  getDay
};
