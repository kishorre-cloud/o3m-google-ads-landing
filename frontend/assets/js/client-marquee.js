/* Client logo marquee: industry chip spotlight (ported from o3m-logo-marquee-kit V3 IndustryShowcase).
   The rows scroll with CSS only. This script marks the active chip, fades other industries' tiles,
   and restarts each row part-way through its loop so the chosen industry's first logo is on screen. */
(function () {
  'use strict';
  var section = document.getElementById('clients');
  if (!section) return;
  var chips = section.querySelectorAll('.cm-chip');
  var marquee = section.querySelector('.cm-marquee');
  var count = section.querySelector('.cm-count');
  var rows = section.querySelectorAll('.cm-row');
  // Where the first spotlighted logo lands when a row restarts (px from the row's left edge), as in V3.
  var START_LEFT = 700, START_RIGHT = 250;

  function startOffset(row, industry) {
    var track = row.querySelector('.cm-track');
    var half = track.querySelector('.cm-half');
    var first = industry && half.querySelector('li[data-industry="' + industry + '"]');
    // A new delay only counts from the animation's start, so restart it.
    track.style.animation = 'none';
    void track.offsetWidth;
    track.style.animation = '';
    if (!first) { track.style.animationDelay = ''; return; }
    var halfPx = half.getBoundingClientRect().width;
    var offsetPx = first.getBoundingClientRect().left - half.getBoundingClientRect().left;
    var rowPx = row.clientWidth;
    var shift = row.getAttribute('data-dir') === 'left'
      ? offsetPx - Math.min(START_LEFT, rowPx * 0.62)
      : Math.min(START_RIGHT, rowPx * 0.22) - offsetPx + halfPx;
    var duration = parseFloat(getComputedStyle(track).animationDuration) || 0;
    if (!halfPx || !duration) return;
    var progress = (((shift % halfPx) + halfPx) % halfPx) / halfPx;
    track.style.animationDelay = '-' + (progress * duration).toFixed(2) + 's';
  }

  function select(chip) {
    var industry = chip.getAttribute('data-industry');
    var all = industry === 'all';
    for (var i = 0; i < chips.length; i++) chips[i].setAttribute('aria-pressed', chips[i] === chip ? 'true' : 'false');
    var items = marquee.querySelectorAll('li[data-industry]');
    for (var j = 0; j < items.length; j++) {
      var tile = items[j].firstElementChild;
      if (!all && items[j].getAttribute('data-industry') !== industry) tile.setAttribute('data-dim', 'true');
      else tile.removeAttribute('data-dim');
    }
    var n = all ? 0 : marquee.querySelectorAll('.cm-half:not([data-dupe]) > li:not([data-dupe])[data-industry="' + industry + '"]').length;
    count.textContent = all ? '' : n + (n === 1 ? ' brand in ' : ' brands in ') + chip.textContent;
    for (var k = 0; k < rows.length; k++) startOffset(rows[k], all ? null : industry);
    marquee.classList.remove('cm-fade');
    void marquee.offsetWidth; // restart the fade-in
    marquee.classList.add('cm-fade');
  }

  for (var c = 0; c < chips.length; c++) {
    chips[c].addEventListener('click', function () { select(this); });
  }
})();
