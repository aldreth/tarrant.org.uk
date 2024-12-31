# tarrant.org.uk

A blog covering 2004 - 2009.

## Development

A static site built using [Jekyll](https://jekyllrb.com/) and deployed to [tarrant.org.uk](https://tarrant.org.uk)
using [netlify](https://www.netlify.com/).

### Requirements

- Ruby v3.3.0 (managed by `.ruby-version` file - use [asdf](https://asdf-vm.com/), [rbenv](https://rbenv.org/) or similar)
- Bundler v2.5.21

### Running locally

- `jekyll serve`

### Deployment

Commit and push to `main`. Github will use a webhook to notify Netlify where the site will be rebuilt.
