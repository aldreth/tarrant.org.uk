async function ensurePagefind() {
  if (window.pagefind) return Promise.resolve(window.pagefind);
  return import('/pagefind/pagefind.js')
    .then(function (mod) {
      mod.options({
        highlightParam: 'highlight'
      });
      window.pagefind = mod;
      return window.pagefind || mod.pagefind || mod.default || mod;
    })
    .catch(function () {
      return new Promise(function (resolve) {
        const s = document.createElement('script');
        s.src = '/pagefind/pagefind.js';
        s.type = 'module';
        s.onload = function () {
          resolve(window.pagefind);
        };
        s.onerror = function () {
          resolve(undefined);
        };
        document.head.appendChild(s);
      });
    });
}

function renderItem(item) {
  let {
    url,
    excerpt,
    meta: {author, date, title, type}
  } = item;

  let variant;
  switch (type) {
    case 'Blog':
      variant = 'secondary';
      break;
    case 'Diary':
      variant = 'tertiary';
      break;
    default:
      variant = 'primary';
      break;
  }

  return `
<custom-card clickable class="mt-s-m">
  <h2 slot="headline" class="text-step-2">
    <a href="${url}">${title}</a>
  </h2>
  <span slot="date">${date}</span>
  <div slot="type" webc:nokeep>
    <span class="button" data-small-button data-button-variant=${variant}>${type}</span>
  </div>
  <div slot="content" webc:nokeep>${excerpt}</div>
</custom-card>
`;
}

function renderItems(q, items) {
  document.querySelector('#results-count').innerHTML = `${items.length} results for ${q}`;

  let content = items.map(renderItem).join('');
  document.querySelector('#results').innerHTML = content;
}

window.addEventListener('DOMContentLoaded', event => {
  ensurePagefind()
    .then(_ => {
      console.log('page find loaded');
    })
    .catch(e => console.error('page find error', e));

  let form = document.querySelector('#form--search');

  form.addEventListener('submit', e => {
    e.preventDefault();

    // Clear current content
    document.querySelector('#results').innerHTML = '';
    document.querySelector('#results-count').innerHTML = '';

    let formData = new FormData(form);
    let q = formData.get('q');
    const possibleFilters = ['Blog', 'Diary', 'Journal'];
    let typeFilters = [];
    possibleFilters.map(possibleFilter => {
      if (formData.get(possibleFilter)) {
        typeFilters.push(possibleFilter);
      }
    });

    window.pagefind
      .search(q, {filters: {type: {any: typeFilters}}})
      .then(search =>
        Promise.all(search.results.map(result => result.data()))
          .then(data => renderItems(q, data))
          .catch(console.error)
      )
      .catch(console.error);
  });
});
