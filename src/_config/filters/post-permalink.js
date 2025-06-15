import slugify from 'slugify';

export const postPermalink = (date, title) => {
  const year = date.substring(0, 4);
  const month = date.substring(6, 8);
  const day = date.substring(8, 10);
  const slug = slugify(title, {
    replacement: '-',
    remove: /[#,&,+()$~%.'":*¿?¡!<>{}]/g,
    lower: true
  });

  const permalink = `${year}/${month}/${day}/${slug}`;

  console.log('***********', permalink);
  return date;
};
