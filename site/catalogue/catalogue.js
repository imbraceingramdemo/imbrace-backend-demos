// The Orvik catalogue page: the request form (fixed lists, generated from what iMBrace checks against), the request's
// status, and the products, all through the site's server functions (/api/...), which talk to iMBrace. Text is set with
// textContent only.
(function () {
  var O = window.CATALOGUE_OPTIONS || { products: [], notes: [] };
  var $ = function (id) { return document.getElementById(id); };
  var el = function (tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  var getJson = function (url, opts) {
    return fetch(url, opts).then(function (r) { return r.json().catch(function () { return { ok: false, message: 'The demo did not answer. Please try again.' }; }); });
  };

  // ---- the request form ----
  var product = $('ask-product'), note = $('ask-note'), go = $('ask-go'), form = $('ask-form');
  O.products.forEach(function (p) { var o = el('option', null, p.label); o.value = p.label; product.appendChild(o); });
  O.notes.forEach(function (n) { var o = el('option', null, n); o.value = n; note.appendChild(o); });
  if (O.dailyLimit) $('ask-small').textContent = 'Choose from the lists only. This demo takes ' + O.dailyLimit + ' requests a day.';
  var result = $('result'), refEl = $('result-ref'), msgEl = $('result-msg'), noteEl = $('result-note');
  var timer = null;
  function show(ref, message, extra) {
    result.hidden = false;
    refEl.textContent = ref ? 'Request ' + ref : '';
    msgEl.textContent = message || '';
    noteEl.textContent = extra || '';
  }
  function poll(ref, tries) {
    clearTimeout(timer);
    getJson('/api/catalogue-status?ref=' + encodeURIComponent(ref)).then(function (s) {
      if (!s || s.ok === false) { show(ref, (s && s.message) || 'iMBrace has no request ' + ref + '.', ''); return; }
      var waiting = s.state === 'drafting';
      var link = location.origin + location.pathname + '?ref=' + encodeURIComponent(ref);
      show(ref, s.message, s.state === 'waiting' ? 'Come back to ' + link + ' to see whether it was approved.' : waiting ? 'Checking again in a few seconds…' : '');
      if (s.state === 'published') load();
      if (waiting && tries > 0) timer = setTimeout(function () { poll(ref, tries - 1); }, 10000);
    });
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    go.disabled = true;
    show('', 'Sending your request to iMBrace…', '');
    getJson('/api/catalogue-request', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ product: product.value, note: note.value }) })
      .then(function (r) {
        go.disabled = false;
        if (!r.ok) { show('', r.message, ''); return; }
        try { history.replaceState(null, '', location.pathname + '?ref=' + encodeURIComponent(r.ref)); } catch (err) { /* ignore */ }
        show(r.ref, r.message, 'Checking its progress in a few seconds…');
        timer = setTimeout(function () { poll(r.ref, 30); }, 8000);
      })
      .catch(function () { go.disabled = false; show('', 'The demo did not answer. Please try again.', ''); });
  });
  var asked = new URLSearchParams(location.search).get('ref');
  if (asked && /^WEB-\d{1,6}$/.test(asked)) poll(asked, 30);
  function ask(label) {
    product.value = label;
    $('ask').scrollIntoView({ behavior: 'smooth', block: 'start' });
    product.focus({ preventScroll: true });
  }

  // ---- the products, read from iMBrace ----
  var list = $('products'), updated = $('updated');
  function render(data) {
    var items = (data && data.products) || [];
    list.textContent = '';
    items.forEach(function (p) {
      var li = el('li', 'product' + (p.approved ? ' has-text' : ''));
      li.id = p.sku;
      var left = el('div');
      left.appendChild(el('h3', null, p.name));
      left.appendChild(el('p', 'meta', p.category + ' · ' + p.sku));
      var facts = el('ul', 'facts');
      if (p.worksWith) { var w = el('li'); w.appendChild(el('span', null, 'Works with')); w.appendChild(el('span', null, p.worksWith)); facts.appendChild(w); }
      (p.facts || []).forEach(function (f) {
        var r = el('li'); r.appendChild(el('span', null, f.name)); r.appendChild(el('span', null, f.value + (f.unit ? ' ' + f.unit : ''))); facts.appendChild(r);
      });
      left.appendChild(facts);
      var right = el('div', 'copy');
      if (p.approved) {
        right.appendChild(el('p', 'short', p.approved.short));
        right.appendChild(el('p', 'long', p.approved.long));
        right.appendChild(el('p', 'when', 'Approved text, version ' + p.approved.version + (p.approved.publishedAt ? ', published ' + p.approved.publishedAt : '') + '.'));
      } else {
        right.appendChild(el('p', 'none', 'No approved description yet.'));
      }
      var label = (O.products.filter(function (x) { return x.sku === p.sku; })[0] || {}).label;
      if (label) {
        var a = el('a', null, p.approved ? 'Request a new description' : 'Request a description');
        a.href = '#ask';
        a.addEventListener('click', function (e) { e.preventDefault(); ask(label); });
        right.appendChild(a);
      }
      li.appendChild(left); li.appendChild(right);
      list.appendChild(li);
    });
    updated.textContent = items.length
      ? 'Read live from iMBrace. ' + items.filter(function (p) { return p.approved; }).length + ' of ' + items.length + ' products have an approved description.'
      : 'iMBrace did not return the catalogue just now. Please reload the page.';
    if (location.hash) { var t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
  }
  function load() { getJson('/api/catalogue').then(render).catch(function () { render(null); }); }
  load();
}());
