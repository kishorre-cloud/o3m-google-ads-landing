/* Service preview motion graphic: one small animated SVG per Google Ads campaign type.
   Used in the Services mega menu and the Services tab panel.
   Usage: O3MServicePreview.render(containerEl, 'search' | 'pmax' | 'yt' | 'display' | 'rmk' | 'shop') */
(function () {
  'use strict';

  var uid = 0;

  function timings() {
    var reduced = false;
    try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (x) {}
    var b = function (s) { return reduced ? '0s' : s + 's'; };
    var d = function (s) { return reduced ? '0.001s' : s + 's'; };
    return {
      reduced: reduced,
      b0: b(0.05), b1: b(0.1), b2: b(0.18), b3: b(0.26), b4: b(0.34), b5: b(0.44), b6: b(0.54), b7: b(0.8),
      d3: d(0.3), d4: d(0.4), d5: d(0.5), d7: d(0.7), d12: d(1.2)
    };
  }

  function fadeIn(begin, dur, rise) {
    var s = '<animate attributeName="opacity" from="0" to="1" begin="' + begin + '" dur="' + dur + '" fill="freeze"/>';
    if (rise) s += '<animateTransform attributeName="transform" type="translate" from="0 ' + rise + '" to="0 0" begin="' + begin + '" dur="' + dur + '" fill="freeze"/>';
    return s;
  }

  function draw(begin, dur) {
    return '<animate attributeName="stroke-dashoffset" from="1" to="0" begin="' + begin + '" dur="' + dur + '" fill="freeze"/>';
  }

  var builders = {
    search: function (t, id) {
      return '<svg viewBox="0 0 320 200" role="img" aria-label="Illustration: a search query returns a results page with a highlighted ad at the top">' +
        '<rect x="24" y="22" width="272" height="34" rx="17" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.28)"/>' +
        '<circle cx="45" cy="39" r="6" fill="none" stroke="#93C5FD" stroke-width="2"/>' +
        '<path d="M49.5 43.5 54 48" stroke="#93C5FD" stroke-width="2" stroke-linecap="round"/>' +
        '<clipPath id="' + id + '-q"><rect x="62" y="28" width="0" height="22"><animate attributeName="width" from="0" to="220" begin="' + t.b0 + '" dur="' + t.d7 + '" fill="freeze"/></rect></clipPath>' +
        '<text x="64" y="44" fill="#E2E8F0" font-size="12" font-weight="600" clip-path="url(#' + id + '-q)">industrial valve supplier</text>' +
        '<g opacity="0">' + fadeIn(t.b4, t.d4, 10) +
          '<rect x="24" y="72" width="272" height="40" rx="10" fill="rgba(37,99,235,.22)" stroke="#2563EB" stroke-width="1.5"/>' +
          '<rect x="36" y="84" width="24" height="16" rx="4" fill="#EAB308"/>' +
          '<text x="41" y="96" fill="#0F172A" font-size="10" font-weight="800">Ad</text>' +
          '<rect x="70" y="84" width="150" height="7" rx="3.5" fill="#BFDBFE"/>' +
          '<rect x="70" y="96" width="100" height="5" rx="2.5" fill="rgba(191,219,254,.55)"/>' +
        '</g>' +
        '<g opacity="0">' + fadeIn(t.b5, t.d4) +
          '<rect x="36" y="126" width="170" height="6" rx="3" fill="rgba(255,255,255,.28)"/>' +
          '<rect x="36" y="138" width="120" height="5" rx="2.5" fill="rgba(255,255,255,.14)"/>' +
        '</g>' +
        '<g opacity="0">' + fadeIn(t.b6, t.d4) +
          '<rect x="36" y="158" width="190" height="6" rx="3" fill="rgba(255,255,255,.28)"/>' +
          '<rect x="36" y="170" width="90" height="5" rx="2.5" fill="rgba(255,255,255,.14)"/>' +
        '</g>' +
      '</svg>';
    },

    pmax: function (t) {
      var spokes = [['M160 100 L60 48', t.b1], ['M160 100 L160 30', t.b2], ['M160 100 L260 48', t.b3],
        ['M160 100 L260 152', t.b4], ['M160 100 L160 170', t.b5], ['M160 100 L60 152', t.b6]];
      var pills = [[22, 36, 60, 52, 'Search'], [122, 18, 160, 34, 'YouTube'], [222, 36, 260, 52, 'Display'],
        [222, 140, 260, 156, 'Discover'], [122, 160, 160, 176, 'Gmail'], [22, 140, 60, 156, 'Maps']];
      return '<svg viewBox="0 0 320 200" role="img" aria-label="Illustration: one Performance Max campaign connects to Search, YouTube, Display, Discover, Gmail and Maps">' +
        '<g stroke="#60A5FA" stroke-width="1.5" fill="none">' +
          spokes.map(function (s) { return '<path d="' + s[0] + '" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1">' + draw(s[1], t.d4) + '</path>'; }).join('') +
        '</g>' +
        '<g font-size="10.5" font-weight="700" fill="#E2E8F0" text-anchor="middle">' +
          pills.map(function (p) {
            return '<rect x="' + p[0] + '" y="' + p[1] + '" width="76" height="24" rx="12" fill="#13244A" stroke="rgba(147,197,253,.5)"/><text x="' + p[2] + '" y="' + p[3] + '">' + p[4] + '</text>';
          }).join('') +
        '</g>' +
        '<rect x="128" y="84" width="64" height="32" rx="10" fill="#2563EB"/>' +
        '<text x="160" y="104" text-anchor="middle" font-size="11" font-weight="800" fill="#FFFFFF">PMax</text>' +
      '</svg>';
    },

    yt: function (t) {
      function stage(begin, cx, color, label) {
        return '<g opacity=".35"><animate attributeName="opacity" from=".35" to="1" begin="' + begin + '" dur="' + t.d3 + '" fill="freeze"/>' +
          '<circle cx="' + cx + '" cy="158" r="6" fill="' + color + '"/><text x="' + cx + '" y="182" fill="#E2E8F0">' + label + '</text></g>';
      }
      return '<svg viewBox="0 0 320 200" role="img" aria-label="Illustration: a video ad plays, moving viewers from awareness to consideration to conversions">' +
        '<rect x="56" y="18" width="208" height="112" rx="12" fill="#13244A" stroke="rgba(255,255,255,.18)"/>' +
        '<circle cx="160" cy="74" r="20" fill="rgba(255,255,255,.12)"/>' +
        '<path d="M154 64 L170 74 L154 84 Z" fill="#FFFFFF"/>' +
        '<rect x="68" y="116" width="184" height="4" rx="2" fill="rgba(255,255,255,.18)"/>' +
        '<rect x="68" y="116" width="0" height="4" rx="2" fill="#EAB308"><animate attributeName="width" from="0" to="184" begin="' + t.b0 + '" dur="' + t.d12 + '" fill="freeze"/></rect>' +
        '<g font-size="10.5" font-weight="700" text-anchor="middle">' +
          stage(t.b1, 80, '#2563EB', 'Awareness') +
          stage(t.b4, 160, '#16A34A', 'Consideration') +
          stage(t.b7, 240, '#EAB308', 'Conversions') +
          '<path d="M88 158 H152 M168 158 H232" stroke="rgba(255,255,255,.25)" stroke-width="1.5" stroke-dasharray="3 4"/>' +
        '</g>' +
      '</svg>';
    },

    display: function (t) {
      return '<svg viewBox="0 0 320 200" role="img" aria-label="Illustration: a web page on the Display Network with an ad placement appearing beside the content">' +
        '<rect x="40" y="18" width="240" height="164" rx="12" fill="#13244A" stroke="rgba(255,255,255,.18)"/>' +
        '<circle cx="56" cy="32" r="3" fill="rgba(255,255,255,.3)"/><circle cx="66" cy="32" r="3" fill="rgba(255,255,255,.3)"/><circle cx="76" cy="32" r="3" fill="rgba(255,255,255,.3)"/>' +
        '<rect x="56" y="52" width="130" height="10" rx="5" fill="rgba(255,255,255,.4)"/>' +
        '<rect x="56" y="72" width="130" height="5" rx="2.5" fill="rgba(255,255,255,.16)"/>' +
        '<rect x="56" y="84" width="118" height="5" rx="2.5" fill="rgba(255,255,255,.16)"/>' +
        '<rect x="56" y="96" width="126" height="5" rx="2.5" fill="rgba(255,255,255,.16)"/>' +
        '<rect x="56" y="116" width="130" height="50" rx="8" fill="rgba(255,255,255,.07)"/>' +
        '<rect x="200" y="52" width="64" height="114" rx="8" fill="none" stroke="rgba(147,197,253,.5)" stroke-dasharray="4 4"/>' +
        '<g opacity="0">' + fadeIn(t.b3, t.d5, 8) +
          '<rect x="200" y="52" width="64" height="114" rx="8" fill="#2563EB"/>' +
          '<rect x="208" y="60" width="22" height="14" rx="3" fill="#EAB308"/>' +
          '<text x="213" y="71" font-size="9" font-weight="800" fill="#0F172A">Ad</text>' +
          '<rect x="210" y="128" width="44" height="6" rx="3" fill="rgba(255,255,255,.85)"/>' +
          '<rect x="210" y="140" width="32" height="14" rx="7" fill="#16A34A"/>' +
        '</g>' +
      '</svg>';
    },

    rmk: function (t) {
      var loop = 'M96 100 C 140 30, 250 30, 262 100 C 250 170, 140 170, 96 100';
      return '<svg viewBox="0 0 320 200" role="img" aria-label="Illustration: a visitor leaves your website and is reconnected with it later">' +
        '<path d="' + loop + '" fill="none" stroke="rgba(255,255,255,.2)" stroke-width="1.5" stroke-dasharray="4 5"/>' +
        '<path d="' + loop + '" fill="none" stroke="#16A34A" stroke-width="2.5" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1">' + draw(t.b1, t.d12) + '</path>' +
        '<rect x="40" y="76" width="64" height="48" rx="10" fill="#2563EB"/>' +
        '<rect x="50" y="88" width="34" height="5" rx="2.5" fill="rgba(255,255,255,.9)"/>' +
        '<rect x="50" y="98" width="44" height="4" rx="2" fill="rgba(255,255,255,.5)"/>' +
        '<rect x="50" y="106" width="28" height="4" rx="2" fill="rgba(255,255,255,.5)"/>' +
        '<g font-size="10.5" font-weight="700" fill="#E2E8F0" text-anchor="middle">' +
          '<text x="72" y="142">Your site</text><text x="200" y="36">Leaves</text><text x="200" y="176">Reconnects</text>' +
        '</g>' +
        '<circle cx="262" cy="100" r="7" fill="#EAB308"/>' +
        '<circle r="6" fill="#FFFFFF" opacity="' + (t.reduced ? 0 : 1) + '"><animateMotion begin="' + t.b1 + '" dur="' + t.d12 + '" fill="freeze" path="' + loop + '"/></circle>' +
      '</svg>';
    },

    shop: function (t) {
      function card(x, begin, highlighted, art) {
        return '<g opacity="0">' + fadeIn(begin, t.d4, 12) +
          '<rect x="' + x + '" y="36" width="82" height="128" rx="12" fill="#13244A" stroke="' + (highlighted ? '#16A34A" stroke-width="2' : 'rgba(255,255,255,.18)') + '"/>' +
          '<rect x="' + (x + 10) + '" y="46" width="62" height="54" rx="8" fill="rgba(255,255,255,.1)"/>' + art +
          '<rect x="' + (x + 10) + '" y="110" width="56" height="6" rx="3" fill="rgba(255,255,255,.6)"/>' +
          '<rect x="' + (x + 10) + '" y="122" width="38" height="5" rx="2.5" fill="rgba(255,255,255,.3)"/>' +
          '<rect x="' + (x + 10) + '" y="138" width="44" height="14" rx="7" fill="' + (highlighted ? '#16A34A' : 'rgba(255,255,255,.18)') + '"/>' +
        '</g>';
      }
      return '<svg viewBox="0 0 320 200" role="img" aria-label="Illustration: product listings appear as Shopping ads">' +
        card(24, t.b1, true, '<circle cx="65" cy="73" r="14" fill="rgba(147,197,253,.5)"/>') +
        card(119, t.b3, false, '<rect x="146" y="60" width="28" height="28" rx="6" fill="rgba(234,179,8,.55)"/>') +
        card(214, t.b5, false, '<path d="M240 88 L255 58 L270 88 Z" fill="rgba(74,222,128,.55)"/>') +
        '<text x="24" y="24" font-size="10.5" font-weight="700" fill="#BBF7D0">Shopping ads</text>' +
      '</svg>';
    }
  };

  function render(el, service) {
    if (!el) return;
    var build = builders[service] || builders.search;
    uid += 1;
    // A freshly inserted outer <svg> starts its own animation timeline, so the graphic replays on every swap.
    el.innerHTML = build(timings(), 'sp' + uid) + '<span class="tag" aria-hidden="true">Illustrative</span>';
  }

  window.O3MServicePreview = { render: render };
})();
