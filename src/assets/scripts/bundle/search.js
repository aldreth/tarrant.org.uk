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

window.addEventListener('DOMContentLoaded', event => {
  ensurePagefind()
    .then(_ => {
      console.log('page find loaded');
    })
    .catch(e => console.error('page find error', e));

  let form = document.querySelector('#form--search');

  form.addEventListener('submit', e => {
    e.preventDefault();

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
      .then(search => Promise.all(search.results.map(result => result.data())).then(console.log))
      .catch(console.error);
  });
});
