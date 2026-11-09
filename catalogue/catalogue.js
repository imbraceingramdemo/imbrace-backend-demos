// The Orvik catalogue page: the request form's choices (fixed lists, generated from what iMBrace checks against) and the
// products, read from data/catalogue.json, which iMBrace writes when a description is approved. Text is set with
// textContent only.
(function () {
  var O = window.CATALOGUE_OPTIONS || { products: [], notes: [] };
  var $ = function (id) { return document.getElementById(id); };
  var el = function (tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

  // ---- the request form ----
  var product = $('ask-product'), note = $('ask-note'), go = $('ask-go');
  O.products.forEach(function (p) { var o = el('option', null, p.label); o.value = p.label; product.appendChild(o); });
  O.notes.forEach(function (n) { var o = el('option', null, n); o.value = n; note.appendChild(o); });
  function link() {
    go.href = O.form + '&product=' + encodeURIComponent(product.value) + '&note=' + encodeURIComponent(note.value);
  }
  product.addEventListener('change', link);
  note.addEventListener('change', link);
  link();
  if (O.dailyLimit) {
    $('ask-small').textContent = 'You need a GitHub account, and requests are public. Choose from the lists only. iMBrace takes '
      + O.dailyLimit + ' requests a day, and closes a request nobody has reviewed after ' + O.expireDays + ' days.';
  }
  function ask(label) {
    product.value = label; link();
    $('ask').scrollIntoView({ behavior: 'smooth', block: 'start' });
    product.focus({ preventScroll: true });
  }

  // ---- the products ----
  var list = $('products'), updated = $('updated');
  function show(data) {
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
      ? 'Published by iMBrace' + (data.updated ? ' on ' + new Date(data.updated).toLocaleString() : '') + '. ' + items.filter(function (p) { return p.approved; }).length + ' of ' + items.length + ' products have an approved description.'
      : 'The catalogue appears here after iMBrace publishes its first approved description.';
    if (location.hash) { var t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
  }
  fetch('data/catalogue.json', { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(show)
    .catch(function () { show(null); });
}());
