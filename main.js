(function () {
  var html = document.documentElement;
  var toggleBtn = document.querySelector('.theme-toggle');
  var toggleIcon = toggleBtn && toggleBtn.querySelector('.theme-icon');
  var STORAGE_KEY = 'ph-theme';

  function getPreferred() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function getStored() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function setTheme(theme, store) {
    html.classList.toggle('dark-mode', theme === 'dark');
    if (toggleIcon) toggleIcon.textContent = theme === 'dark' ? '\u2600' : '\u263E';
    if (store) { try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) {} }
  }

  function init() {
    var stored = getStored();
    setTheme(stored || getPreferred(), false);
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      var next = html.classList.contains('dark-mode') ? 'light' : 'dark';
      setTheme(next, true);
    });
  }

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    if (!getStored()) setTheme(e.matches ? 'dark' : 'light', false);
  });

  init();
})();
