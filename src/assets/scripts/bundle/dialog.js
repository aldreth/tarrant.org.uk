// manages the behavior of modal several dialogs on a page: open / close buttons and light dismiss.
// each gallery gets its own set of dialogs, so prev / next navigation stays within one gallery.
// dialogs with an id'd heading are linkable: the url hash names the open dialog.

const galleries = document.querySelectorAll('.gallery, .card-gallery');

const dialogId = modal => modal.querySelector('h2[id]')?.id;

const show = modal => {
  modal.showModal();
  modal.focus();
  const id = dialogId(modal);
  if (id) history.replaceState(history.state, '', `${location.pathname}${location.search}#${id}`);
};

galleries.forEach(gallery => {
  const modals = Array.from(gallery.querySelectorAll('dialog'));
  const openButtons = gallery.querySelectorAll('button[data-index]');

  openButtons.forEach((button, index) => {
    button.addEventListener('click', () => show(modals[index]));
  });

  modals.forEach((modal, index) => {
    const closeBtn = modal.querySelector('button[data-close]');
    const prevBtn = modal.querySelector('button[data-nav="prev"]');
    const nextBtn = modal.querySelector('button[data-nav="next"]');
    const prev = () => modals[(index - 1 + modals.length) % modals.length];
    const next = () => modals[(index + 1) % modals.length];

    closeBtn?.addEventListener('click', () => modal.close());

    const copyLink = modal.querySelector('a[data-copy-link]');
    copyLink?.addEventListener('click', async event => {
      event.preventDefault();
      try {
        await navigator.clipboard.writeText(copyLink.href);
      } catch {
        window.prompt('Copy this link', copyLink.href);
        return;
      }
      const label = copyLink.textContent;
      copyLink.textContent = copyLink.dataset.copiedLabel;
      setTimeout(() => (copyLink.textContent = label), 2000);
    });

    // the close event fires after prev / next has already moved the hash on, so only clear our own
    modal.addEventListener('close', () => {
      const id = dialogId(modal);
      if (id && location.hash === `#${id}`) {
        history.replaceState(history.state, '', location.pathname + location.search);
      }
    });

    if (!prevBtn && !nextBtn) return;

    prevBtn?.addEventListener('click', () => {
      modal.close();
      show(prev());
    });

    nextBtn?.addEventListener('click', () => {
      modal.close();
      show(next());
    });

    // arrow navigation
    modal.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        modal.close();
        show(next());
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        modal.close();
        show(prev());
      }
    });

    // swipe navigation
    let startX = 0;
    let endX = 0;
    modal.addEventListener('touchstart', event => {
      if (event.touches.length > 1) return;
      startX = event.touches[0].screenX;
    });
    modal.addEventListener('touchend', event => {
      if (event.changedTouches.length > 1) return;
      endX = event.changedTouches[0].screenX;
      handleSwipe();
    });

    function handleSwipe() {
      const diff = endX - startX;
      if (Math.abs(diff) < 50) return;
      modal.close();
      show(diff > 0 ? prev() : next()); // swipe right → prev, swipe left → next
    }
  });
});

const openFromHash = () => {
  if (!location.hash) return;
  const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  const modal = target?.closest('.gallery dialog, .card-gallery dialog');
  if (!modal || modal.open) return;
  document.querySelectorAll('.gallery dialog[open], .card-gallery dialog[open]').forEach(open => open.close());
  show(modal);
};

openFromHash();
window.addEventListener('hashchange', openFromHash);

window.addEventListener('click', event => {
  document.querySelectorAll('.gallery dialog, .card-gallery dialog').forEach(modal => {
    if (event.target === modal) modal.close();
  });
});
