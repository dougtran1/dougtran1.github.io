/**
 * editor-bar.js — portable editor toolbar for portfolio subpages.
 * Drop <script src="../editor-bar.js"></script> before </body> on any page.
 */
(function () {
  // Only activate when accessed from the editor (requires ?eb=1 in the URL)
  if (new URLSearchParams(location.search).get('eb') !== '1') return;

  const PAGE_FILE = location.pathname.split('/').pop() || 'index.html';
  const DRAFT_KEY = 'editor_draft_' + PAGE_FILE;
  let editMode = false;
  let currentImgBlock = null;
  let currentCellIndex = -1; // -1 = add new, >= 0 = replace at index

  /* ── Inject styles ──────────────────────────────────────────────── */
  const css = document.createElement('style');
  css.id = 'editor-bar-style';
  css.textContent = `
    body { padding-top: 60px !important; }
    nav  { top: 60px !important; }
    #editor-bar {
      position: fixed; top: 0; left: 0; right: 0; z-index: 9999;
      background: #1a1a1a; border-bottom: 2px solid #0071e3;
      display: flex; align-items: center; gap: 1rem; padding: 0 1.5rem; height: 60px;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
      font-size: 0.85rem;
    }
    #editor-bar .eb-logo { font-weight: 600; color: #0071e3; font-size: 0.95rem; margin-right: 0.25rem; letter-spacing: -0.01em; }
    #editor-bar .eb-sep  { color: #444; }
    #editor-bar .eb-page { color: #86868b; font-size: 0.8rem; letter-spacing: -0.01em; }
    .eb-btn {
      padding: 0.4rem 1rem; border-radius: 980px; font-size: 0.82rem; font-weight: 500;
      cursor: pointer; border: 1px solid #3a3a3c; background: #2d2d2f;
      color: #f5f5f7; transition: border-color 0.2s, color 0.2s; letter-spacing: -0.01em;
      font-family: inherit;
    }
    .eb-btn:hover { border-color: #0071e3; color: #0071e3; }
    .eb-btn.primary { background: #0071e3; color: #fff; border-color: #0071e3; }
    .eb-btn.primary:hover { background: #0077ed; }
    #eb-badge {
      background: #1a3a1a; color: #4caf50; border: 1px solid #2d6a2d;
      padding: 0.2rem 0.7rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600;
      display: none; letter-spacing: 0.02em;
    }
    #eb-hint { color: #86868b; font-size: 0.78rem; margin-left: auto; }

    /* ── Text editing ── */
    body.eb-editing [contenteditable="true"] {
      outline: none; border-radius: 3px;
      box-shadow: 0 0 0 2px rgba(0,113,227,0.5);
      cursor: text; min-width: 20px; min-height: 1em;
    }
    body.eb-editing [contenteditable="true"]:focus {
      box-shadow: 0 0 0 2px #0071e3;
      background: rgba(0,113,227,0.05);
    }

    /* ── Empty placeholder ── */
    .placeholder-img { position: relative; overflow: hidden; }
    body.eb-editing .placeholder-img:not(.eb-has-images) {
      cursor: pointer; border-color: rgba(0,113,227,0.5) !important;
    }
    .eb-img-overlay {
      position: absolute; inset: 0; display: flex; flex-direction: column;
      align-items: center; justify-content: center; gap: 0.4rem;
      background: rgba(0,0,0,0.55); opacity: 0; transition: opacity 0.2s; z-index: 2;
      color: #0071e3; font-size: 0.85rem; font-weight: 600; pointer-events: none;
      font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
    }
    body.eb-editing .placeholder-img:not(.eb-has-images):hover .eb-img-overlay { opacity: 1; }

    /* ── Filled image block ── */
    .placeholder-img.eb-has-images {
      aspect-ratio: unset !important; background: transparent !important;
      border: none !important; display: block !important; padding: 0 !important;
      min-height: unset !important; justify-content: unset !important;
      align-items: unset !important; overflow: visible !important;
    }

    /* ── Block controls (move / remove block) ── */
    .eb-block-controls {
      display: none; align-items: center; gap: 0.35rem; margin-bottom: 0.5rem;
    }
    body.eb-editing .placeholder-img.eb-has-images .eb-block-controls { display: flex; }
    .eb-ctrl-btn {
      padding: 0.2rem 0.65rem; border-radius: 980px; font-size: 0.72rem; font-weight: 500;
      cursor: pointer; border: 1px solid #3a3a3c; background: #2d2d2f;
      color: #f5f5f7; transition: border-color 0.2s, color 0.2s; white-space: nowrap;
      font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
    }
    .eb-ctrl-btn:hover { border-color: #0071e3; color: #0071e3; }
    .eb-ctrl-btn.danger:hover { border-color: #dc3545; color: #dc3545; }

    /* ── Image grid ── */
    .eb-img-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; width: 100%; align-items: flex-start; }
    .eb-img-cell { position: relative; flex: 1 1 200px; min-width: 120px; overflow: hidden; border-radius: 6px; }
    .eb-img-cell img.eb-uploaded { width: 100%; height: auto; display: block; border-radius: 6px; }

    /* Replace overlay per cell */
    .eb-cell-overlay {
      position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
      background: rgba(0,0,0,0.55); opacity: 0; transition: opacity 0.2s;
      color: #0071e3; font-size: 0.8rem; font-weight: 600;
      border-radius: 6px; pointer-events: none;
      font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
    }
    body.eb-editing .eb-img-cell:hover .eb-cell-overlay { opacity: 1; }
    body.eb-editing .eb-img-cell { cursor: pointer; }

    /* Delete button per cell */
    .eb-del-btn {
      position: absolute; top: 5px; right: 5px; width: 22px; height: 22px;
      background: rgba(0,0,0,0.72); border: 1px solid rgba(255,255,255,0.18);
      border-radius: 50%; color: #fff; font-size: 0.7rem; font-weight: 600;
      display: none; align-items: center; justify-content: center;
      cursor: pointer; z-index: 5; transition: background 0.15s; font-family: inherit;
    }
    body.eb-editing .eb-img-cell:hover .eb-del-btn { display: flex; }
    .eb-del-btn:hover { background: rgba(200,30,30,0.88) !important; border-color: transparent !important; }

    /* Add image button */
    .eb-add-cell { flex: 0 0 auto; display: none; align-items: center; justify-content: center; min-width: 80px; min-height: 60px; }
    body.eb-editing .eb-add-cell { display: flex; }
    .eb-add-btn {
      cursor: pointer; border: 1.5px dashed rgba(0,113,227,0.6); border-radius: 8px;
      padding: 0.6rem 1rem; color: #0071e3; font-size: 0.78rem; font-weight: 500;
      white-space: nowrap; transition: border-color 0.2s, background 0.2s;
      font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
    }
    .eb-add-btn:hover { background: rgba(0,113,227,0.08); border-color: #0071e3; }

    /* Caption */
    .eb-caption {
      margin-top: 0.5rem; font-size: 0.82rem; color: var(--text-muted, #86868b);
      text-align: center; font-style: italic; outline: none; min-height: 1.2em; line-height: 1.5;
    }
    .eb-caption:empty::before { content: 'Add a caption or subheading...'; color: #555; pointer-events: none; }
    body.eb-editing .eb-caption { box-shadow: 0 1px 0 rgba(0,113,227,0.4); cursor: text; }
    body.eb-editing .eb-caption:focus { box-shadow: 0 1px 0 #0071e3; }

    /* ── Insert zones ── */
    .eb-insert-zone {
      display: none; align-items: center; justify-content: center;
      height: 28px; position: relative; margin: 0;
    }
    body.eb-editing .eb-insert-zone { display: flex; }
    .eb-insert-zone::before {
      content: ''; position: absolute; left: 0; right: 0; top: 50%;
      height: 1px; background: rgba(0,113,227,0.18);
    }
    .eb-insert-btn {
      position: relative; z-index: 1; background: #1a1a1a;
      border: 1px solid rgba(0,113,227,0.35); border-radius: 20px;
      padding: 0.15rem 0.9rem; color: rgba(0,113,227,0.7);
      font-size: 0.72rem; font-weight: 500; cursor: pointer;
      transition: background 0.2s, border-color 0.2s, color 0.2s;
      font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
    }
    .eb-insert-btn:hover { background: rgba(0,113,227,0.12); border-color: #0071e3; color: #0071e3; }

    /* ── Toast ── */
    #eb-toast {
      position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%);
      background: #2d2d2f; border: 1px solid #0071e3; color: #f5f5f7;
      padding: 0.6rem 1.4rem; border-radius: 980px; font-size: 0.85rem;
      opacity: 0; transition: opacity 0.3s; z-index: 99999; pointer-events: none;
      font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
    }
    #eb-toast.show { opacity: 1; }
  `;
  document.head.appendChild(css);

  /* ── Toolbar ─────────────────────────────────────────────────────── */
  const bar = document.createElement('div');
  bar.id = 'editor-bar';
  bar.innerHTML =
    '<span class="eb-logo">Portfolio Editor</span>' +
    '<span class="eb-sep">|</span>' +
    '<span class="eb-page">' + PAGE_FILE + '</span>' +
    '<span class="eb-sep">|</span>' +
    '<button class="eb-btn" id="eb-toggle-btn" onclick="ebToggleEdit()">Enable Editing</button>' +
    '<span id="eb-badge">EDIT MODE ON</span>' +
    '<button class="eb-btn" onclick="ebSave()">Save Draft</button>' +
    '<button class="eb-btn primary" onclick="ebExport()">Export \u2192 ' + PAGE_FILE + '</button>' +
    '<span id="eb-hint">Click \u201cEnable Editing\u201d to start</span>';
  document.body.insertBefore(bar, document.body.firstChild);

  /* ── File input ──────────────────────────────────────────────────── */
  const imgInput = document.createElement('input');
  imgInput.type = 'file'; imgInput.accept = 'image/*';
  imgInput.style.display = 'none'; imgInput.id = 'eb-img-input';
  document.body.appendChild(imgInput);

  imgInput.addEventListener('change', function () {
    const file = this.files[0];
    if (!file || !currentImgBlock) return;
    const block = currentImgBlock;
    const cellIdx = currentCellIndex;
    const reader = new FileReader();
    reader.onload = function (e) {
      const src = e.target.result;
      const images = getImages(block);
      const caption = getCaption(block);
      if (cellIdx === -1) { images.push(src); ebToast('Image added!'); }
      else                 { images[cellIdx] = src; ebToast('Image replaced!'); }
      buildImageGrid(block, images, caption);
      saveBlockImages(block);
    };
    reader.readAsDataURL(file);
    this.value = '';
  });

  /* ── Toast ───────────────────────────────────────────────────────── */
  const toast = document.createElement('div');
  toast.id = 'eb-toast';
  document.body.appendChild(toast);

  /* ── DOM helpers ─────────────────────────────────────────────────── */
  function getImages(block) {
    return Array.from(block.querySelectorAll('.eb-img-cell:not(.eb-add-cell) img.eb-uploaded'))
      .map(function (img) { return img.src; });
  }
  function getCaption(block) {
    return (block.querySelector('.eb-caption') || {}).textContent || '';
  }

  /* ── Build / rebuild the image grid inside a placeholder block ───── */
  function buildImageGrid(block, images, caption) {
    block.classList.add('eb-has-images');

    // Wrap and hide any bare text nodes
    Array.from(block.childNodes).forEach(function (node) {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
        const span = document.createElement('span');
        span.className = 'placeholder-label';
        span.style.display = 'none';
        span.textContent = node.textContent;
        block.replaceChild(span, node);
      }
    });
    block.querySelectorAll('.placeholder-label').forEach(function (el) { el.style.display = 'none'; });

    // Clear old structure
    block.querySelectorAll('.eb-img-grid, .eb-caption, .eb-img-overlay, .eb-block-controls')
      .forEach(function (el) { el.remove(); });

    // Block controls bar (move up / move down / remove inserted)
    block.appendChild(makeBlockControls(block));

    // Grid
    const grid = document.createElement('div');
    grid.className = 'eb-img-grid';
    images.forEach(function (src, i) { grid.appendChild(makeImageCell(block, src, i)); });

    // "Add another image" button
    const addCell = document.createElement('div');
    addCell.className = 'eb-img-cell eb-add-cell';
    const addBtn = document.createElement('div');
    addBtn.className = 'eb-add-btn';
    addBtn.textContent = '+ Add image';
    addBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (!editMode) return;
      currentImgBlock = block; currentCellIndex = -1;
      imgInput.click();
    });
    addCell.appendChild(addBtn);
    grid.appendChild(addCell);
    block.appendChild(grid);

    // Caption / subheading
    const cap = document.createElement('div');
    cap.className = 'eb-caption';
    if (caption) cap.textContent = caption;
    cap.contentEditable = editMode ? 'true' : 'false';
    cap.addEventListener('blur', function () { saveBlockImages(block); });
    block.appendChild(cap);
  }

  function makeImageCell(block, src, index) {
    const cell = document.createElement('div');
    cell.className = 'eb-img-cell';

    const img = document.createElement('img');
    img.className = 'eb-uploaded'; img.src = src;

    const replaceOverlay = document.createElement('div');
    replaceOverlay.className = 'eb-cell-overlay';
    replaceOverlay.textContent = '\uD83D\uDD04 Replace';

    // Delete button (×)
    const delBtn = document.createElement('button');
    delBtn.className = 'eb-del-btn';
    delBtn.title = 'Remove this image';
    delBtn.innerHTML = '&times;';
    delBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (!editMode) return;
      const images = getImages(block);
      const caption = getCaption(block);
      images.splice(index, 1);
      if (images.length > 0) {
        buildImageGrid(block, images, caption);
        saveBlockImages(block);
        ebToast('Image removed.');
      } else if (block.getAttribute('data-eb-inserted')) {
        const key = block.getAttribute('data-eb-img-key');
        if (key) localStorage.removeItem(key);
        block.remove();
        if (editMode) addInsertZones();
        ebToast('Image block removed.');
      } else {
        revertToEmptyPlaceholder(block);
        ebToast('Image removed.');
      }
    });

    // Click cell to replace image
    cell.addEventListener('click', function (e) {
      e.stopPropagation();
      if (!editMode) return;
      currentImgBlock = block; currentCellIndex = index;
      imgInput.click();
    });

    cell.appendChild(img);
    cell.appendChild(replaceOverlay);
    cell.appendChild(delBtn);
    return cell;
  }

  /* ── Block controls (↑ ↓ and remove-block for inserted) ─────────── */
  function makeBlockControls(block) {
    const ctrl = document.createElement('div');
    ctrl.className = 'eb-block-controls';

    function mkBtn(label, title, cls, handler) {
      const btn = document.createElement('button');
      btn.className = 'eb-ctrl-btn' + (cls ? ' ' + cls : '');
      btn.title = title; btn.textContent = label;
      btn.addEventListener('click', function (e) { e.stopPropagation(); if (editMode) handler(); });
      return btn;
    }

    ctrl.appendChild(mkBtn('↑ Move up',   'Move image block up',   '', function () { moveBlockUp(block); }));
    ctrl.appendChild(mkBtn('↓ Move down', 'Move image block down', '', function () { moveBlockDown(block); }));

    if (block.getAttribute('data-eb-inserted')) {
      ctrl.appendChild(mkBtn('✕ Remove block', 'Delete this image block', 'danger', function () {
        const key = block.getAttribute('data-eb-img-key');
        if (key) localStorage.removeItem(key);
        block.remove();
        if (editMode) addInsertZones();
        ebToast('Image block removed.');
      }));
    }
    return ctrl;
  }

  /* ── Move image blocks up / down within .case-study ─────────────── */
  function contentSiblings(block) {
    return Array.from(block.parentNode.children).filter(function (el) {
      return !el.classList.contains('eb-insert-zone');
    });
  }
  function moveBlockUp(block) {
    const siblings = contentSiblings(block);
    const idx = siblings.indexOf(block);
    if (idx <= 0) { ebToast('Already at the top.'); return; }
    block.parentNode.insertBefore(block, siblings[idx - 1]);
    if (editMode) addInsertZones();
  }
  function moveBlockDown(block) {
    const siblings = contentSiblings(block);
    const idx = siblings.indexOf(block);
    if (idx >= siblings.length - 1) { ebToast('Already at the bottom.'); return; }
    block.parentNode.insertBefore(siblings[idx + 1], block);
    if (editMode) addInsertZones();
  }

  /* ── Revert a block to its empty placeholder state ───────────────── */
  function revertToEmptyPlaceholder(block) {
    block.classList.remove('eb-has-images');
    block.querySelectorAll('.eb-img-grid, .eb-caption, .eb-block-controls').forEach(function (el) { el.remove(); });
    block.querySelectorAll('.placeholder-label').forEach(function (el) { el.style.display = ''; });
    if (!block.querySelector('.eb-img-overlay')) {
      const ov = document.createElement('div');
      ov.className = 'eb-img-overlay';
      ov.innerHTML = '\uD83D\uDCF7 Click to upload image';
      block.appendChild(ov);
    }
    const key = block.getAttribute('data-eb-img-key');
    if (key) localStorage.removeItem(key);
  }

  /* ── Persist a block's images + caption to localStorage ─────────── */
  function saveBlockImages(block) {
    const key = block.getAttribute('data-eb-img-key');
    if (!key) return true;
    try {
      localStorage.setItem(key, JSON.stringify({ images: getImages(block), caption: getCaption(block) }));
      return true;
    } catch (e) {
      return false; // QuotaExceededError — image too large
    }
  }

  /* ── Set up a single placeholder block ──────────────────────────── */
  function setupSingleImageBlock(block) {
    if (block._ebInit) return; // prevent duplicate listeners
    block._ebInit = true;

    // Overlay for empty state
    if (!block.querySelector('.eb-img-overlay') && !block.classList.contains('eb-has-images')) {
      const ov = document.createElement('div');
      ov.className = 'eb-img-overlay';
      ov.innerHTML = '\uD83D\uDCF7 Click to upload image';
      block.appendChild(ov);
    }

    // Click on empty block to upload
    block.addEventListener('click', function () {
      if (!editMode || block.classList.contains('eb-has-images')) return;
      currentImgBlock = block; currentCellIndex = -1;
      imgInput.click();
    });

    // Restore from localStorage
    const key = block.getAttribute('data-eb-img-key');
    const savedRaw = key ? localStorage.getItem(key) : null;
    if (savedRaw) {
      try {
        const saved = JSON.parse(savedRaw);
        if (saved.images && saved.images.length > 0) {
          buildImageGrid(block, saved.images, saved.caption || '');
        }
      } catch (e) {
        // Legacy: plain base64 string
        buildImageGrid(block, [savedRaw], '');
        saveBlockImages(block);
      }
    } else {
      // No saved data — clean up any stale structure from draft restore
      block.classList.remove('eb-has-images');
      block.querySelectorAll('.eb-img-grid, .eb-caption').forEach(function (el) { el.remove(); });
      block.querySelectorAll('.placeholder-label').forEach(function (el) { el.style.display = ''; });
    }
  }

  /* ── Scan and set up all .placeholder-img blocks ─────────────────── */
  function setupImageBlocks() {
    document.querySelectorAll('.placeholder-img').forEach(function (block, i) {
      // Preserve any key already on the element (e.g. after draft restore or insertion)
      if (!block.getAttribute('data-eb-img-key')) {
        block.setAttribute('data-eb-img-key', 'eb_img_' + PAGE_FILE + '_' + i);
      }
      block._ebInit = false; // allow re-init after innerHTML swap
      setupSingleImageBlock(block);
    });
  }

  /* ── Insert zones (shown in edit mode between every content child) ── */
  function makeInsertZone() {
    const zone = document.createElement('div');
    zone.className = 'eb-insert-zone';
    const btn = document.createElement('button');
    btn.className = 'eb-insert-btn'; btn.type = 'button';
    btn.textContent = '+ Insert image block';
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      insertNewImageBlock(zone);
    });
    zone.appendChild(btn);
    return zone;
  }

  function addInsertZones() {
    const study = document.querySelector('.case-study');
    if (!study) return;
    removeInsertZones();
    // One zone before each content child, plus one at the end
    Array.from(study.children).forEach(function (child) {
      study.insertBefore(makeInsertZone(), child);
    });
    study.appendChild(makeInsertZone());
  }

  function removeInsertZones() {
    document.querySelectorAll('.eb-insert-zone').forEach(function (el) { el.remove(); });
  }

  function insertNewImageBlock(zone) {
    const key = 'eb_img_' + PAGE_FILE + '_ins_' + Date.now();
    const block = document.createElement('div');
    block.className = 'placeholder-img';
    block.setAttribute('data-eb-img-key', key);
    block.setAttribute('data-eb-inserted', 'true');
    // Inline base styles so the empty placeholder renders without the page's own CSS rule
    block.style.cssText =
      'width:100%;aspect-ratio:16/9;background:var(--surface,#1c1c1e);' +
      'border:1px solid var(--border,#3a3a3c);border-radius:var(--radius,12px);' +
      'display:flex;align-items:center;justify-content:center;' +
      'color:var(--text-muted,#86868b);font-size:0.85rem;margin:2rem 0;' +
      'position:relative;overflow:hidden;';
    block.textContent = '[ New image block ]';

    zone.parentNode.insertBefore(block, zone);
    setupSingleImageBlock(block);
    addInsertZones(); // rebuild around new block
    ebToast('Block added — click it to upload an image.');
  }

  /* ── Elements to make contenteditable ──────────────────────────── */
  function editableNodes() {
    return document.querySelectorAll([
      'nav .nav-name',
      '.case-study h1', '.case-study h2', '.case-study p', '.case-study li',
      '.case-study .meta-item span', '.case-study .project-label',
      '.case-study blockquote', '.case-study .tech-tag', '.case-study .swatch span'
    ].join(', '));
  }

  /* ── Toggle edit mode ───────────────────────────────────────────── */
  window.ebToggleEdit = function () {
    editMode = !editMode;
    document.body.classList.toggle('eb-editing', editMode);
    const btn   = document.getElementById('eb-toggle-btn');
    const badge = document.getElementById('eb-badge');
    const hint  = document.getElementById('eb-hint');
    editableNodes().forEach(function (el) {
      el.setAttribute('contenteditable', editMode ? 'true' : 'false');
    });
    document.querySelectorAll('.eb-caption').forEach(function (el) {
      el.contentEditable = editMode ? 'true' : 'false';
    });
    if (editMode) {
      btn.textContent = 'Disable Editing';
      btn.classList.add('primary');
      badge.style.display = 'inline-block';
      hint.textContent = 'Edit text \u00b7 Click images to upload \u00b7 \u2191\u2193 to reorder \u00b7 Save Draft often';
      addInsertZones();
    } else {
      btn.textContent = 'Enable Editing';
      btn.classList.remove('primary');
      badge.style.display = 'none';
      hint.textContent = 'Click \u201cEnable Editing\u201d to start';
      removeInsertZones();
    }
  };

  /* ── Save draft ─────────────────────────────────────────────────── */
  window.ebSave = function () {
    // Save HTML structure (images stripped — restored from per-block keys)
    try {
      const content = document.querySelector('.case-study');
      if (content) {
        const clone = content.cloneNode(true);
        clone.querySelectorAll('img.eb-uploaded').forEach(function (img) { img.removeAttribute('src'); });
        clone.querySelectorAll('.eb-insert-zone').forEach(function (el) { el.remove(); });
        localStorage.setItem(DRAFT_KEY, clone.innerHTML);
      }
    } catch (e) {
      ebToast('Save failed — browser storage is full. Use Export \u2192 ' + PAGE_FILE + ' instead.');
      return;
    }
    // Persist each block's images + caption
    var imgSaveFailed = false;
    document.querySelectorAll('.placeholder-img[data-eb-img-key]').forEach(function (block) {
      if (!saveBlockImages(block)) imgSaveFailed = true;
    });
    if (imgSaveFailed) {
      ebToast('Draft saved (text & layout only) \u2014 images too large for browser storage. Use Export to keep images.');
    } else {
      ebToast('Draft saved!');
    }
  };

  /* ── Export clean HTML ──────────────────────────────────────────── */
  window.ebExport = function () {
    const clone = document.documentElement.cloneNode(true);
    ['#editor-bar', '#editor-bar-style', '#eb-toast', '#eb-img-input'].forEach(function (sel) {
      clone.querySelector(sel)?.remove();
    });
    clone.querySelectorAll('[contenteditable]').forEach(function (el) { el.removeAttribute('contenteditable'); });
    clone.querySelectorAll(
      '.eb-img-overlay, .eb-cell-overlay, .eb-add-cell, .eb-block-controls, .eb-insert-zone'
    ).forEach(function (el) { el.remove(); });
    clone.querySelector('body')?.classList.remove('eb-editing');
    // Bake sizing reset into filled blocks (injected stylesheet won't be present)
    clone.querySelectorAll('.placeholder-img.eb-has-images').forEach(function (block) {
      block.style.cssText +=
        ';aspect-ratio:unset!important;background:transparent!important;' +
        'border:none!important;display:block!important;padding:0!important;' +
        'min-height:unset!important;justify-content:unset!important;' +
        'align-items:unset!important;overflow:visible!important;';
    });
    // Drop empty captions from export
    clone.querySelectorAll('.eb-caption').forEach(function (el) {
      if (!el.textContent.trim()) el.remove();
    });
    const html = '<!DOCTYPE html>\n' + clone.outerHTML;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    a.download = PAGE_FILE; a.click();
    ebToast(PAGE_FILE + ' downloaded!');
  };

  /* ── Toast helper ───────────────────────────────────────────────── */
  function ebToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(function () { toast.classList.remove('show'); }, 2500);
  }

  /* ── Init ───────────────────────────────────────────────────────── */
  setupImageBlocks();

  // Restore saved text draft (images come from per-block keys)
  const saved = localStorage.getItem(DRAFT_KEY);
  if (saved) {
    const content = document.querySelector('.case-study');
    if (content) {
      content.innerHTML = saved;
      setupImageBlocks(); // re-init on new DOM nodes
    }
  }
})();
