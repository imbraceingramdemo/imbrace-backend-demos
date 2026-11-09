// The Harbourline service desk page: one fixed choice (generated from what iMBrace checks against), sent through the
// site's server function (/api/support-request), which waits for iMBrace's answer. Text is set with textContent only.
(function () {
  var O = window.SUPPORT_OPTIONS || { problems: [], guides: [] };
  var $ = function (id) { return document.getElementById(id); };
  var el = function (tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  var problem = $('ask-problem'), go = $('ask-go'), form = $('ask-form');
  O.problems.forEach(function (p) { var o = el('option', null, p); o.value = p; problem.appendChild(o); });
  if (O.dailyLimit) $('ask-small').textContent = 'Choose from the list only. This demo takes ' + O.dailyLimit + ' requests a day.';
  var result = $('result'), refEl = $('result-ref'), msgEl = $('result-msg');
  function show(ref, message) { result.hidden = false; refEl.textContent = ref ? 'Ticket ' + ref : ''; msgEl.textContent = message || ''; }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    go.disabled = true;
    show('', 'iMBrace is filing your ticket and asking its service-desk assistant. This takes about 20 seconds…');
    fetch('/api/support-request', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ problem: problem.value }) })
      .then(function (r) { return r.json().catch(function () { return { ok: false, message: 'The demo did not answer. Please try again.' }; }); })
      .then(function (r) { go.disabled = false; show(r.ticket || '', r.message || 'The demo did not answer. Please try again.'); })
      .catch(function () { go.disabled = false; show('', 'The demo did not answer. Please try again.'); });
  });
  var list = $('guides');
  O.guides.forEach(function (g) {
    var li = el('li');
    li.appendChild(el('span', 'id', g.id));
    li.appendChild(el('span', 'title', g.title));
    li.appendChild(el('span', 'applies', 'Applies to ' + g.appliesTo));
    list.appendChild(li);
  });
}());
