// Page transition — intercepts clicks on home-bound links, fades/slides the
// current page out, then navigates. Pairs with `.page-exit` CSS in case-study.css.
(function () {
  const SELECTOR = 'a[href*="variations/v2-maximalist/"]';
  const DURATION = 420;

  document.querySelectorAll(SELECTOR).forEach((link) => {
    link.addEventListener("click", (e) => {
      // Respect modifier keys (new tab / new window / download).
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      const href = link.getAttribute("href");
      if (!href) return;
      e.preventDefault();
      document.body.classList.add("page-exit");
      setTimeout(() => { window.location.href = href; }, DURATION);
    });
  });
})();
