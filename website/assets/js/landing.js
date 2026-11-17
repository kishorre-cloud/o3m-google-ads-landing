/* O3M /google-ads-management/ page behaviour:
   mega menu, mobile menu, hero scene (scroll fill, parallax, stage hotspots), search-to-sale chain,
   reveal-on-scroll, services tabs, FAQ accordion and the enquiry form. */
(function () {
  'use strict';

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function mq(q) { try { return window.matchMedia(q).matches; } catch (x) { return false; } }

  var reduced = mq('(prefers-reduced-motion: reduce)');
  var fine = mq('(hover: hover) and (pointer: fine)');
  var root = document.getElementById('o3m-root');

  var ORDER = ['search', 'pmax', 'yt', 'display', 'rmk', 'shop'];
  var NAMES = { search: 'Search Advertising', pmax: 'Performance Max', yt: 'YouTube Advertising', display: 'Display Advertising', rmk: 'Remarketing', shop: 'Shopping campaigns' };
  var MM_CAPS = {
    search: 'Search — reach people already searching for what you sell, with budget kept on the searches that produce enquiries.',
    pmax: 'Performance Max — reach across Google, guided by conversion data that reflects real enquiries or sales.',
    yt: 'YouTube — introduce your business on video and remarket to people who already know it.',
    display: 'Display — stay visible to your audience between searches, judged on the enquiries it contributes.',
    rmk: 'Remarketing — stay in front of visitors who are still comparing options.',
    shop: 'Ecommerce & Shopping — Shopping ads and Performance Max measured on orders and revenue.'
  };

  function setExpanded(btn, open) {
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    var chev = $('.chev', btn);
    if (chev) chev.classList.toggle('open', open);
  }

  /* ---------- services tabs ---------- */
  var currentTab = 'search';
  function selectTab(id, focus) {
    currentTab = id;
    $$('.tablist [role="tab"]').forEach(function (t) {
      var on = t.getAttribute('data-svc') === id;
      t.classList.toggle('on', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    $$('#panel-svc [data-panel]').forEach(function (p) { p.hidden = p.getAttribute('data-panel') !== id; });
    $('#panel-svc').setAttribute('aria-labelledby', 'tab-' + id);
    $('#svc-name').textContent = NAMES[id];
    window.O3MServicePreview.render($('#svc-preview'), id);
  }
  $$('.tablist [role="tab"]').forEach(function (t) {
    t.addEventListener('click', function () { selectTab(t.getAttribute('data-svc')); });
    t.addEventListener('keydown', function (ev) {
      var i = ORDER.indexOf(currentTab), n = -1;
      if (ev.key === 'ArrowDown' || ev.key === 'ArrowRight') n = (i + 1) % ORDER.length;
      else if (ev.key === 'ArrowUp' || ev.key === 'ArrowLeft') n = (i - 1 + ORDER.length) % ORDER.length;
      else if (ev.key === 'Home') n = 0;
      else if (ev.key === 'End') n = ORDER.length - 1;
      if (n < 0) return;
      ev.preventDefault();
      selectTab(ORDER[n], true);
    });
  });
  selectTab('search');

  /* ---------- services mega menu ---------- */
  var mmWrap = $('#mm-wrap'), mmBtn = $('#mm-btn'), mmPanel = $('#mm-panel');
  var mmOpen = false, mmByHover = false, mmTimer = 0, mmSvc = 'search';

  function setMmSvc(id, force) {
    if (id === mmSvc && !force) return;
    mmSvc = id;
    $$('.mm-item').forEach(function (a) { a.classList.toggle('on', a.getAttribute('data-svc') === id); });
    $('#mm-caption').textContent = MM_CAPS[id];
    window.O3MServicePreview.render($('#mm-preview'), id);
  }
  function setMm(open, focusBtn) {
    clearTimeout(mmTimer);
    mmOpen = open;
    mmPanel.hidden = !open;
    setExpanded(mmBtn, open);
    if (open) setMmSvc(mmSvc, true); // replay the preview animation on each open
    if (!open && focusBtn) mmBtn.focus();
  }

  mmWrap.addEventListener('mouseenter', function () {
    if (!fine) return;
    clearTimeout(mmTimer);
    if (!mmOpen) mmTimer = setTimeout(function () { mmByHover = true; setMm(true); }, 90);
  });
  mmWrap.addEventListener('mouseleave', function () {
    if (!fine) return;
    clearTimeout(mmTimer);
    mmTimer = setTimeout(function () { setMm(false); }, 240);
  });
  mmBtn.addEventListener('click', function () {
    clearTimeout(mmTimer);
    // A hover already opened it: the click that follows shouldn't immediately close it.
    if (mmOpen && mmByHover) { mmByHover = false; return; }
    mmByHover = false;
    setMm(!mmOpen);
  });
  mmWrap.addEventListener('focusout', function (ev) {
    var nxt = ev.relatedTarget;
    if (nxt && !mmWrap.contains(nxt)) setMm(false);
  });
  $('.navlinks').addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && mmOpen) { ev.preventDefault(); setMm(false, true); }
  });
  document.addEventListener('pointerdown', function (ev) {
    if (mmOpen && !(ev.target.closest && ev.target.closest('#mm-wrap'))) setMm(false);
  }, true);
  $$('.mm-item').forEach(function (a) {
    var id = a.getAttribute('data-svc');
    a.addEventListener('mouseenter', function () { setMmSvc(id); });
    a.addEventListener('focus', function () { setMmSvc(id); });
    a.addEventListener('click', function () { selectTab(id); setMm(false); });
  });

  /* ---------- mobile menu ---------- */
  var menuBtn = $('#menu-btn'), menu = $('#mobile-menu'), msBtn = $('#ms-btn'), msList = $('#m-services');
  function setMenu(open) {
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    $('.ic-open', menuBtn).hidden = open;
    $('.ic-close', menuBtn).hidden = !open;
    if (!open) { msList.hidden = true; setExpanded(msBtn, false); }
  }
  menuBtn.addEventListener('click', function () { setMenu(menu.hidden); });
  msBtn.addEventListener('click', function () {
    msList.hidden = !msList.hidden;
    setExpanded(msBtn, !msList.hidden);
  });
  $$('[data-close-menu]', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  $$('a[data-svc]', msList).forEach(function (a) {
    a.addEventListener('click', function () { selectTab(a.getAttribute('data-svc')); setMenu(false); });
  });

  /* ---------- hero stage hotspots ---------- */
  var STAGES = [
    ['Search intent.', 'Search terms and keywords are reviewed so ads match what buyers actually search for.'],
    ['Ad interaction.', 'Ad creatives and audience signals are refined around the enquiries you want.'],
    ['Landing page.', 'Landing pages and forms are assessed for conversion and lead quality.'],
    ['Qualified enquiry.', 'Conversion tracking, enhanced conversions and GA4 record what counts.'],
    ['CRM visibility.', 'CRM integration and call tracking connect each lead to its outcome.'],
    ['Sales follow-up.', 'Lead quality, follow-up and reporting are reviewed together.']
  ];
  var scene = $('#scene'), nodes = $$('#hero-svg .hn'), labels = $$('.hlabel'), hots = $$('.hot'), cap = $('#scene-cap');
  var hoverStage = -1, pinStage = -1;

  function paintStage() {
    var cur = hoverStage >= 0 ? hoverStage : pinStage;
    scene.className = 'scene' + (cur >= 0 ? ' holding h' + cur : '');
    nodes.forEach(function (n, i) { n.classList.toggle('act', cur === i); });
    labels.forEach(function (l, i) { l.classList.toggle('on', cur === i); });
    hots.forEach(function (h, i) { h.setAttribute('aria-pressed', cur === i ? 'true' : 'false'); });
    cap.innerHTML = '';
    var strong = document.createElement('strong');
    strong.textContent = cur >= 0 ? STAGES[cur][0] : (fine ? 'Select a stage' : 'Tap a stage');
    cap.appendChild(strong);
    cap.appendChild(document.createTextNode(' ' + (cur >= 0 ? STAGES[cur][1] : 'to see what O3M reviews at each step — not just the ad.')));
  }
  hots.forEach(function (h, i) {
    function on() { if (hoverStage !== i) { hoverStage = i; paintStage(); } }
    function off() { if (hoverStage !== -1) { hoverStage = -1; paintStage(); } }
    h.addEventListener('mouseenter', on);
    h.addEventListener('focus', on);
    h.addEventListener('mouseleave', off);
    h.addEventListener('blur', off);
    h.addEventListener('click', function () { pinStage = pinStage === i ? -1 : i; hoverStage = -1; paintStage(); });
  });
  paintStage();

  /* ---------- FAQ ---------- */
  $$('.faqbtn').forEach(function (b) {
    var panel = document.getElementById(b.getAttribute('aria-controls'));
    b.addEventListener('click', function () {
      panel.hidden = !panel.hidden;
      setExpanded(b, !panel.hidden);
    });
  });

  /* ---------- "why campaigns underperform" video ---------- */
  // Reduced motion: stop the autoplay loop on its poster and let the visitor start it themselves.
  var whyVideo = $('#why-video');
  // Client feedback: the chain animation read as rushed; 0.85x keeps it calmer (the problem list follows currentTime, so it stays in sync).
  if (whyVideo) whyVideo.defaultPlaybackRate = whyVideo.playbackRate = 0.85;
  if (whyVideo && reduced) {
    whyVideo.removeAttribute('autoplay');
    whyVideo.pause();
    whyVideo.controls = true;
  } else if (whyVideo && typeof IntersectionObserver !== 'undefined') {
    // Only play the loop while it is on screen.
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          whyVideo.preload = 'auto'; // no autoplay attribute, so nothing buffers until it is first seen
          var p = whyVideo.play();
          if (p && p.catch) p.catch(function () {}); // autoplay blocked: the poster stays
        } else {
          whyVideo.pause();
        }
      });
    }, { threshold: 0.2 }).observe(whyVideo);
  } else if (whyVideo) {
    var wp = whyVideo.play(); // no IntersectionObserver: play as the removed autoplay attribute did
    if (wp && wp.catch) wp.catch(function () {});
  }

  /* ---------- reveals ---------- */
  if (!reduced) root.setAttribute('data-motion', 'on');
  var revealEls = $$('[data-reveal], .endline');
  if (reduced || typeof IntersectionObserver === 'undefined') {
    revealEls.forEach(function (el) { el.setAttribute('data-in', ''); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.setAttribute('data-in', ''); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- scroll + pointer driven motion (hero and chain) ---------- */
  var hero = $('#hero'), heroSvg = $('#hero-svg'), chain = $('#chain');
  var steps = $$('[data-step]', chain), rnodes = $$('.rnode', chain), rdots = $$('.rdot', chain), chainName = $('#chain-name');
  var CHAIN_NAMES = ['01 Search intent', '02 Ad interaction', '03 Landing page', '04 Qualified enquiry', '05 CRM visibility', '06 Sales follow-up'];
  var raf = 0, mx = 0, my = 0, tx = 0, ty = 0, paused = false, chainActive = -1;

  function setChainActive(ca) {
    if (ca === chainActive) return;
    chainActive = ca;
    rnodes.forEach(function (n, i) { n.classList.toggle('done', i < ca); n.classList.toggle('on', i === ca); });
    steps.forEach(function (s, i) { s.classList.toggle('on', i === ca); });
    rdots.forEach(function (d, i) { d.classList.toggle('on', i <= ca); });
    chainName.textContent = CHAIN_NAMES[ca];
  }

  // Custom properties inherit, so each write restyles the subtree; skip writes that would not change anything.
  var written = {};
  function put(el, k, v) { if (written[k] !== v) { written[k] = v; el.style.setProperty(k, v); } }

  function tick() {
    raf = 0;
    var vh = window.innerHeight || 800;
    var again = false;
    // Read every rect before the first write: a read after a write forces a style recalc.
    var r = hero.getBoundingClientRect();
    var first, last, idx = 0;
    if (steps.length) {
      first = steps[0].getBoundingClientRect();
      last = steps[steps.length - 1].getBoundingClientRect();
      steps.forEach(function (s, i) { if (s.getBoundingClientRect().top < vh * 0.55) idx = i; });
    }
    if (ptr) {
      if (ptr.y >= r.top && ptr.y <= r.bottom) {
        tx = Math.max(-1, Math.min(1, ((ptr.x - r.left) / r.width - 0.5) * 2));
        ty = Math.max(-1, Math.min(1, ((ptr.y - r.top) / r.height - 0.5) * 2));
      } else { tx = 0; ty = 0; }
      ptr = null;
    }

    var off = r.bottom < 0 || r.top > vh;
    var p = Math.max(0, Math.min(1, -r.top / (r.height * 0.9)));
    if (!reduced) {
      mx += (tx - mx) * 0.12;
      my += (ty - my) * 0.12;
      if (Math.abs(tx - mx) > 0.002 || Math.abs(ty - my) > 0.002) again = true;
      if (!off) {
        put(hero, '--p', p.toFixed(4));
        put(hero, '--fill', Math.min(1, p / 0.42).toFixed(4));
        put(hero, '--mx', mx.toFixed(4));
        put(hero, '--my', my.toFixed(4));
      }
    }
    // Pause the ambient SVG animation while the hero is off screen.
    if (heroSvg.pauseAnimations && off !== paused) {
      paused = off;
      if (off) heroSvg.pauseAnimations(); else heroSvg.unpauseAnimations();
    }

    if (steps.length) {
      var span = (last.top + last.height * 0.5) - first.top;
      var cp = Math.max(0, Math.min(1, (vh * 0.55 - first.top) / Math.max(1, span)));
      put(chain, '--cp', reduced ? '1' : cp.toFixed(4));
      setChainActive(idx);
    }
    if (again) schedule();
  }
  function schedule() { if (!raf) raf = requestAnimationFrame(tick); }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  // Only the latest position is kept; tick() maps it against the hero rect it already read.
  var ptr = null;
  document.addEventListener('pointermove', function (e) {
    if (reduced || !fine || e.pointerType !== 'mouse') return;
    ptr = { x: e.clientX, y: e.clientY };
    schedule();
  }, { passive: true });
  schedule();

  // Pause the chain's ambient CSS loops while the section is off screen.
  if (typeof IntersectionObserver !== 'undefined') {
    new IntersectionObserver(function (entries) {
      chain.classList.toggle('in-view', entries[entries.length - 1].isIntersecting);
    }).observe(chain);
  } else {
    chain.classList.add('in-view');
  }

  /* ---------- enquiry form ---------- */
  var form = $('#enquiry-form');
  var REQUIRED_ORDER = ['name', 'email', 'mobile', 'company', 'goal', 'website'];
  var GOALS = { leads: 'Qualified leads', ecom: 'Ecommerce sales', both: 'Qualified leads and ecommerce sales', unsure: 'Not sure yet' };
  var ERR_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>';
  var errs = {}, attempted = false, busy = false;
  var moreBtn = $('#more-btn'), more = $('#more-fields');
  var summary = $('#form-summary'), failBox = $('#form-error'), live = $('#form-live'), submit = $('#f-submit');

  function val(k) { var el = document.getElementById('f-' + k); return el ? el.value : ''; }
  function validate() {
    var e = {};
    if (val('name').trim().length < 2) e.name = 'Enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val('email').trim())) e.email = 'Enter a valid email, like name@company.com.';
    var m = val('mobile'), digits = m.replace(/[^0-9]/g, '');
    if (digits.length < 10 || digits.length > 15 || /[^0-9+\-\s()]/.test(m)) e.mobile = 'Enter a valid mobile number (10–15 digits).';
    if (val('company').trim().length < 2) e.company = 'Enter your company name.';
    if (!val('goal')) e.goal = 'Choose your primary goal.';
    var w = val('website').trim();
    if (w && !/^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/\S*)?$/i.test(w)) e.website = 'Enter a valid website, like company.com.';
    return e;
  }
  function paintField(k) {
    var input = document.getElementById('f-' + k), msg = document.getElementById('f-' + k + '-err');
    var err = errs[k];
    input.classList.toggle('bad', !!err);
    input.setAttribute('aria-invalid', err ? 'true' : 'false');
    if (err) { input.setAttribute('aria-describedby', 'f-' + k + '-err'); msg.innerHTML = ERR_ICON; msg.appendChild(document.createTextNode(err)); }
    else input.removeAttribute('aria-describedby');
    msg.hidden = !err;
  }
  function paintSummary() {
    var n = Object.keys(errs).filter(function (k) { return errs[k]; }).length;
    summary.hidden = !(attempted && n > 0);
    $('#form-summary-text').textContent = n === 1 ? '1 field needs attention.' : n + ' fields need attention.';
  }
  function setMore(open) { more.hidden = !open; setExpanded(moreBtn, open); }
  moreBtn.addEventListener('click', function () { setMore(more.hidden); });

  REQUIRED_ORDER.forEach(function (k) {
    var input = document.getElementById('f-' + k);
    var evt = input.tagName === 'SELECT' ? 'change' : 'input';
    input.addEventListener(evt, function () {
      // Once a field shows an error, re-check it as the visitor types so the message clears promptly.
      if (errs[k]) { errs[k] = validate()[k]; paintField(k); paintSummary(); }
      failBox.hidden = true;
    });
    input.addEventListener('blur', function () {
      if (!input.value && !attempted) return;
      errs[k] = validate()[k];
      paintField(k); paintSummary();
    });
  });

  function setSubmitting(on) {
    busy = on;
    submit.disabled = on;
    submit.setAttribute('aria-disabled', on ? 'true' : 'false');
    $('.spin', submit).hidden = !on;
    $('.lbl', submit).textContent = on ? 'Sending…' : 'Request a Consultation';
    live.textContent = on ? 'Sending your enquiry' : '';
  }
  function fail() {
    setSubmitting(false);
    failBox.hidden = false;
    live.textContent = 'Your enquiry could not be sent. Your details are kept.';
  }
  function succeed() {
    try { sessionStorage.setItem('o3m-enquiry-goal', GOALS[val('goal')] || ''); } catch (x) {}
    window.location.href = form.getAttribute('data-thanks') || '/thank-you/';
  }

  /* Ad click IDs and UTM values: read from the landing URL, kept in sessionStorage so they survive in-page
     navigation and reloads, and copied into the form's hidden fields before sending. A new value in the URL wins. */
  var TRACK_KEYS = ['gclid', 'gbraid', 'wbraid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  // Any tracking value in the URL counts as a new visit source (last-touch), so the whole set is replaced.
  // Wrapped so a failure here can never stop the submit handler from being attached.
  var tracked = {};
  try {
    tracked = JSON.parse(sessionStorage.getItem('o3m-attribution') || '{}');
    if (!tracked || typeof tracked !== 'object' || Array.isArray(tracked)) tracked = {};
    var params = new URLSearchParams(window.location.search);
    if (TRACK_KEYS.some(function (k) { return params.get(k); })) {
      tracked = { landing_page: window.location.origin + window.location.pathname };
      TRACK_KEYS.forEach(function (k) { var v = params.get(k); if (v) tracked[k] = v; });
      sessionStorage.setItem('o3m-attribution', JSON.stringify(tracked));
    }
  } catch (x) { /* no sessionStorage or URLSearchParams: send whatever was read */ }
  function fillTracking() {
    if (!tracked.landing_page) tracked.landing_page = window.location.origin + window.location.pathname;
    TRACK_KEYS.concat('landing_page').forEach(function (k) {
      var input = form.elements[k];
      if (input) input.value = String(tracked[k] || '').slice(0, 500);
    });
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    if (busy) return;
    fillTracking();
    errs = validate();
    var bad = Object.keys(errs);
    REQUIRED_ORDER.forEach(paintField);
    if (bad.length) {
      attempted = true;
      if (errs.website) setMore(true);
      paintSummary();
      var firstBad = REQUIRED_ORDER.filter(function (k) { return errs[k]; })[0];
      document.getElementById('f-' + firstBad).focus();
      return;
    }
    attempted = false;
    paintSummary();
    failBox.hidden = true;
    setSubmitting(true);

    var endpoint = form.getAttribute('data-endpoint');
    if (!endpoint) {
      // No endpoint configured yet: simulate a submission. Append ?simulate=fail to preview the error state.
      var simulateFail = /[?&]simulate=fail\b/.test(window.location.search);
      setTimeout(function () { if (simulateFail) fail(); else succeed(); }, 1400);
      return;
    }
    fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      .then(function (res) { if (res.ok) succeed(); else fail(); })
      .catch(fail);
  });
})();
