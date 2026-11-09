// The Harbourline service desk page: the request form's one choice (a fixed list, generated from what iMBrace checks
// against) and the fix guides' titles. Text is set with textContent only.
(function () {
  var O = window.SUPPORT_OPTIONS || { problems: [], guides: [] };
  var $ = function (id) { return document.getElementById(id); };
  var el = function (tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  var problem = $('ask-problem'), go = $('ask-go');
  O.problems.forEach(function (p) { var o = el('option', null, p); o.value = p; problem.appendChild(o); });
  function link() { go.href = O.form + '&problem=' + encodeURIComponent(problem.value); }
  problem.addEventListener('change', link);
  link();
  if (O.dailyLimit) $('ask-small').textContent = 'You need a GitHub account, and requests are public. Choose from the list only. iMBrace takes ' + O.dailyLimit + ' requests a day on this demo.';
  var list = $('guides');
  O.guides.forEach(function (g) {
    var li = el('li');
    li.appendChild(el('span', 'id', g.id));
    li.appendChild(el('span', 'title', g.title));
    li.appendChild(el('span', 'applies', 'Applies to ' + g.appliesTo));
    list.appendChild(li);
  });
}());
