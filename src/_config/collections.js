import _ from 'lodash';

// import {slugifyString} from './filters/slugify';

/** All blog posts as a collection. */
export const getAllPosts = collection => {
  return collection.getFilteredByGlob('./src/posts/**/*.md').reverse();
};

export const getAllBlogPosts = collection => {
  return collection
    .getFilteredByGlob('./src/posts/**/*.md')
    .filter(post => post.data.type == 'Blog')
    .reverse();
};

export const getAllDiaryPosts = collection => {
  return collection
    .getFilteredByGlob('./src/posts/**/*.md')
    .filter(post => post.data.type == 'Diary')
    .reverse();
};
export const getAllJournalPosts = collection => {
  return collection
    .getFilteredByGlob('./src/posts/**/*.md')
    .filter(post => post.data.type == 'Journal')
    .reverse();
};

/** All relevant pages as a collection for sitemap.xml */
export const showInSitemap = collection => {
  return collection.getFilteredByGlob('./src/**/*.{md,njk}');
};

/** All tags from all posts as a collection - excluding custom collections */
export const tagList = collection => {
  const tagsSet = new Set();
  collection.getAll().forEach(item => {
    if (!item.data.tags) return;
    item.data.tags.filter(tag => !['posts', 'docs', 'all'].includes(tag)).forEach(tag => tagsSet.add(tag));
  });
  return Array.from(tagsSet).sort();
};

export const getAllPostsByYear = collection =>
  _.chain(collection.getFilteredByGlob('./src/posts/**/*.md').reverse())
    .groupBy(post => post.date.getFullYear())
    .toPairs()
    .reverse()
    .value();

// Year / Month collection
export const getAllPostsByYearMonth = collection =>
  _.chain(collection.getFilteredByGlob('./src/posts/**/*.md').reverse())
    .groupBy(post => {
      const year = post.date.getFullYear();
      const month = String(post.date.getMonth() + 1).padStart(2, '0');
      return `${year}/${month}`;
    })
    .toPairs()
    .reverse()
    .value();

// Year / Month / Day collection
export const getAllPostsByYearMonthDay = collection =>
  _.chain(collection.getFilteredByGlob('./src/posts/**/*.md').reverse())
    .groupBy(post => {
      const year = post.date.getFullYear();
      const month = String(post.date.getMonth() + 1).padStart(2, '0');
      const day = String(post.date.getDate()).padStart(2, '0');
      return `${year}/${month}/${day}`;
    })
    .toPairs()
    .reverse()
    .value();

// Author collection
export const getAllPostsByAuthor = collection =>
  _.chain(collection.getFilteredByGlob('./src/posts/**/*.md').reverse())
    .groupBy(post => post.data.author)
    .toPairs()
    .reverse()
    .value();

// export const getAllPostsByYear = collection => {
//   const allPosts = collection.getFilteredByGlob('./src/posts/**/*.md');

//   const byYear = {};

//   // Go through all original posts
//   allPosts.forEach(post => {
//     // Assuming there's a date field in front matter for each post,
//     // extract the year for the post
//     const date = new Date(post.data.date);
//     const year = date.getFullYear().toString();

//     // If current year has not been encoutered yet,
//     // create a new entry.
//     if (!byYear[year]) {
//       byYear[year] = [];
//     }

//     // Add post to the corresponding year
//     byYear[year].push(post);
//   });

//   console.log('FAYFAY', JSON.stringify(byYear));
//   // Our posts are now grouped by year so
//   // let's return it as the new collection
//   return byYear;
// };
