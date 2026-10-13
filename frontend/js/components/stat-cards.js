/* 顶部统计：英雄区总盈亏 + 统计条 */
window.StatCards = (function () {
  function statItem(label, value) {
    var d = document.createElement('div');
    d.className = 'stat';
    var k = document.createElement('span');
    k.className = 'stat-k';
    k.textContent = label;
    var v = document.createElement('span');
    v.className = 'stat-v';
    v.textContent = value;
    d.appendChild(k);
    d.appendChild(v);
    return d;
  }

  function render(el, totals) {
    var wrap = document.createElement('div');
    wrap.className = 'stats';

    var plCls = totals.pl >= 0 ? 'pos' : 'neg';

    var hero = document.createElement('div');
    hero.className = 'hero';
    var label = document.createElement('div');
    label.className = 'hero-label';
    label.textContent = '总盈亏（元）';
    var value = document.createElement('div');
    value.className = 'hero-value ' + plCls;
    value.textContent = Fmt.money(totals.pl);
    hero.appendChild(label);
    hero.appendChild(value);
    wrap.appendChild(hero);

    var strip = document.createElement('div');
    strip.className = 'stat-strip';
    strip.appendChild(statItem('品种数', String(totals.nvarieties)));
    strip.appendChild(statItem('交易笔数', String(totals.ntrades)));
    strip.appendChild(statItem('开仓手数', Fmt.lots(totals.open)));
    strip.appendChild(statItem('平仓手数', Fmt.lots(totals.close)));
    wrap.appendChild(strip);

    el.appendChild(wrap);
    animateCount(value, totals.pl);
  }

  /* 唯一的页面载入动画：总盈亏从 0 滚动到终值；尊重减少动效偏好 */
  function animateCount(el, target) {
    var reduced = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !target) { el.textContent = Fmt.money(target); return; }
    var start = null;
    var dur = 900;
    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = Fmt.money(target * eased);
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = Fmt.money(target);
    }
    requestAnimationFrame(frame);
  }

  return { render: render };
})();
