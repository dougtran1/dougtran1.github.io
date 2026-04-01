(function () {
  // Inject lightbox styles
  var style = document.createElement('style');
  style.textContent =
    '.lb-overlay {' +
      'position:fixed;top:0;left:0;width:100%;height:100%;' +
      'background:rgba(0,0,0,0.88);z-index:9999;' +
      'display:flex;align-items:center;justify-content:center;' +
      'cursor:zoom-out;opacity:0;transition:opacity 0.3s ease;' +
    '}' +
    '.lb-overlay.lb-visible { opacity:1; }' +
    '.lb-overlay img {' +
      'max-width:90vw;max-height:90vh;border-radius:10px;' +
      'box-shadow:0 8px 40px rgba(0,0,0,0.5);' +
      'transform:scale(0.92);transition:transform 0.3s ease;' +
      'cursor:default;' +
    '}' +
    '.lb-overlay.lb-visible img { transform:scale(1); }' +
    '.case-study .placeholder-img img,' +
    '.case-study img { cursor:zoom-in; }';
  document.head.appendChild(style);

  // Open lightbox
  function openLightbox(src) {
    var overlay = document.createElement('div');
    overlay.className = 'lb-overlay';
    var img = document.createElement('img');
    img.src = src;
    img.alt = '';
    overlay.appendChild(img);
    document.body.appendChild(overlay);
    // Prevent background scroll
    document.body.style.overflow = 'hidden';
    // Trigger animation
    requestAnimationFrame(function () {
      overlay.classList.add('lb-visible');
    });
    // Close on click outside image
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) {
        closeLightbox(overlay);
      }
    });
    // Close on Escape
    function onKey(e) {
      if (e.key === 'Escape') {
        closeLightbox(overlay);
        document.removeEventListener('keydown', onKey);
      }
    }
    document.addEventListener('keydown', onKey);
  }

  // Close lightbox
  function closeLightbox(overlay) {
    overlay.classList.remove('lb-visible');
    setTimeout(function () {
      overlay.remove();
      document.body.style.overflow = '';
    }, 300);
  }

  // Attach click handlers to all case-study images
  document.addEventListener('click', function (e) {
    var img = e.target.closest('.case-study img');
    if (img && img.src && !img.closest('.lb-overlay')) {
      e.preventDefault();
      openLightbox(img.src);
    }
  });
})();
