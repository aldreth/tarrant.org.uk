const bottom = [
  {
    text: 'Privacy',
    url: '/privacy/'
  }
];

if (process.env.NODE_ENV == 'development') {
  bottom.shift({
    text: 'Style guide',
    url: '/styleguide/'
  });
}

export default {
  top: [
    {
      text: 'About',
      url: '/about/'
    },
    {
      text: 'Contact',
      url: '/contact/'
    },
    {
      text: 'Tags',
      url: '/tags/'
    }
  ],
  bottom
};
