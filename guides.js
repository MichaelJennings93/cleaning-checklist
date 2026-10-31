(() => {
  const $ = id => document.getElementById(id);
  const escape = value => String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const icons = {
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
    checklist: '<rect x="5" y="4" width="15" height="17" rx="2"/><path d="M9 2v4m7-4v4M9 11l1 1 2-2m2 1h3M9 16l1 1 2-2m2 1h3"/>',
    book: '<path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1m0-15c3-2 6-2 9-1v15c-3-1-6-1-9 1V5Z"/>',
    repair: '<path d="M14 6a5 5 0 0 0-6 6L3 17a3 3 0 0 0 4 4l5-5a5 5 0 0 0 6-6l-3 3-4-4 3-3Z"/>',
    bag: '<path d="M4 7h16l-1 14H5L4 7Zm4 0V6a4 4 0 0 1 8 0v1"/>',
    send: '<path d="m21 3-7 18-4-7-7-4 18-7ZM10 14 21 3"/>',
    search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
    play: '<circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4V8Z"/>'
  };
  const icon = name => '<svg viewBox="0 0 24 24" aria-hidden="true">' + icons[name] + '</svg>';
  document.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); });
  const taskMap = new Map(ROOMS.flatMap(r => r.tasks).map(t => [t[1], t]));
  const guideMap = new Map(HOME_GUIDES.map(g => [g.id, g]));
  const dialog = $('guide-dialog');
  let category = 'all', opener = null;
  const plain = html => { const el = document.createElement('div'); el.innerHTML = html || ''; return el.textContent; };
  const searchText = new Map(HOME_GUIDES.map(g => [g.id, [g.title, g.model, g.summary, g.tags, g.note, plain(g.html), ...(g.tasks || []).map(t => taskMap.get(t)?.[2] || ''), ...(g.steps || []).flat()].join(' ').toLowerCase()]));
  const videoCount = new Set(HOME_GUIDES.flatMap(g => g.videos || [])).size;
  $('library-summary').textContent = HOME_GUIDES.length + ' guides · ' + videoCount + ' helpful videos';
  $('guide-filters').innerHTML = GUIDE_CATEGORIES.map(([id, label]) => '<button type="button" data-category="' + id + '" aria-pressed="' + (id === category) + '">' + escape(label) + '</button>').join('');
  function render() {
    const query = $('guide-search').value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const matches = HOME_GUIDES.filter(g => (category === 'all' || g.category === category) && query.every(word => searchText.get(g.id).includes(word)));
    $('clear-search').hidden = !$('guide-search').value;
    $('guide-count').textContent = matches.length + ' of ' + HOME_GUIDES.length + ' guides';
    $('guide-empty').hidden = !!matches.length;
    $('guide-grid').innerHTML = matches.map(g => {
      const p = ALL_PHOTOS[g.photo], count = (g.videos || []).length;
      return '<article class="guide-card"><button class="guide-open" data-guide="' + g.id + '" aria-haspopup="dialog" aria-label="Open ' + escape(g.title) + ' guide"><span class="guide-card-picture"><img src="' + p.src + '" alt="' + escape(g.imageAlt || p.alt || plain(p.cap)) + '" loading="lazy" decoding="async" class="' + (g.fit || '') + '" style="object-position:' + (g.position || '50% 50%') + '"><span class="guide-type">' + icon(count ? 'play' : 'book') + (count ? count + (count === 1 ? ' video' : ' videos') : 'Care notes') + '</span></span><span class="guide-card-copy"><span class="guide-card-model">' + escape(g.model) + '</span><h3>' + escape(g.title) + '</h3><p>' + escape(g.summary) + '</p><span class="guide-card-link">' + (count ? 'Watch & learn' : 'Open care guide') + icon('arrow') + '</span></span></button></article>';
    }).join('');
  }
  function openGuide(id, setHash = true) {
    const g = guideMap.get(id);
    if (!g) return;
    opener = document.querySelector('[data-guide="' + id + '"]') || $('guide-search');
    $('guide-title').textContent = g.title;
    $('guide-model').textContent = g.model;
    let body = '<p class="guide-intro">' + escape(g.summary) + '</p>';
    if (g.note) body += '<p class="guide-note">' + escape(g.note) + '</p>';
    if (g.videos?.length) {
      body += '<h3 class="guide-section-title">Watch how it’s done</h3><div class="guide-video-list">' + g.videos.map(key => {
        const v = GUIDE_VIDEOS[key], url = V[key][1], videoId = new URL(url).searchParams.get('v');
        return '<a class="guide-video" href="' + escape(url) + '" target="_blank" rel="noopener" aria-label="Watch ' + escape(v.title) + ' on YouTube (opens a new tab)"><span class="guide-video-thumb"><img src="https://i.ytimg.com/vi/' + videoId + '/mqdefault.jpg" alt="" loading="lazy">' + icon('play') + '</span><span class="guide-video-text"><strong>' + escape(v.title) + '</strong><small>' + escape(v.by + ' · ' + v.detail) + '</small><span class="video-action">Watch on YouTube ↗</span></span></a>';
      }).join('') + '</div><p class="guide-video-hint">Videos open in YouTube. Come back here for the care notes.</p>';
    }
    body += '<h3 class="guide-section-title">Care notes for our home</h3><div class="guide-care">';
    if (g.html) body += g.html;
    else {
      const steps = g.steps || (g.tasks || []).map(title => [title, taskMap.get(title)[2]]);
      body += '<ol>' + steps.map(([title, text]) => '<li><strong>' + escape(title) + '</strong><p>' + escape(text) + '</p></li>').join('') + '</ol>';
    }
    if (g.source) body += '<a class="guide-source" href="' + escape(g.source[1]) + '" target="_blank" rel="noopener">' + escape(g.source[0]) + ' ↗</a>';
    body += '</div>';
    const pictures = g.photos || [g.photo];
    body += '<details class="guide-photos"><summary>' + icon('book') + 'Equipment photos<span>+</span></summary><div class="guide-photo-grid">' + pictures.map(key => {
      const p = ALL_PHOTOS[key];
      return '<figure><img src="' + p.src + '" alt="' + escape(g.imageAlt || p.alt || plain(p.cap)) + '" loading="lazy"><figcaption>' + escape(g.imageAlt || p.alt || plain(p.cap)) + '</figcaption></figure>';
    }).join('') + '</div></details><a class="guide-end-link" href="supplies.html?request=1">' + icon('bag') + 'Request a refill or replacement part →</a>';
    $('guide-body').innerHTML = body;
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    if (setHash) history.replaceState(null, '', '#' + id);
  }
  $('guide-grid').addEventListener('click', e => { const button = e.target.closest('[data-guide]'); if (button) openGuide(button.dataset.guide); });
  $('guide-filters').addEventListener('click', e => {
    const button = e.target.closest('[data-category]'); if (!button) return;
    category = button.dataset.category;
    document.querySelectorAll('[data-category]').forEach(b => b.setAttribute('aria-pressed', b === button));
    render();
  });
  $('guide-search').addEventListener('input', render);
  $('clear-search').addEventListener('click', () => { $('guide-search').value = ''; render(); $('guide-search').focus(); });
  $('reset-guides').addEventListener('click', () => {
    category = 'all'; $('guide-search').value = '';
    document.querySelectorAll('[data-category]').forEach(b => b.setAttribute('aria-pressed', b.dataset.category === 'all'));
    render(); $('guide-search').focus();
  });
  $('close-guide').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { const r = dialog.getBoundingClientRect(); if (e.target === dialog && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) dialog.close(); });
  dialog.addEventListener('close', () => { history.replaceState(null, '', location.pathname + location.search); opener?.focus(); });
  window.addEventListener('hashchange', () => { const id = location.hash.slice(1); if (guideMap.has(id)) openGuide(id, false); else if (dialog.open) dialog.close(); });
  render();
  if (guideMap.has(location.hash.slice(1))) openGuide(location.hash.slice(1), false);
})();
