/* 顶部统计卡片组件 */
window.StatCards = (function () {
  function stat(label, value, cls) {
    var d = document.createElement('div');
    d.className = 'stat';
    var k = document.createElement('div');
    k.className = 'k';
    k.textContent = label;
    var v = document.createElement('div');
    v.className = 'v' + (cls ? ' ' + cls : '');
    v.textContent = value;
    d.appendChild(k);
    d.appendChild(v);
    return d;
  }

  function render(el, totals) {
    var wrap = document.createElement('div');
    wrap.className = 'stats';
    var plCls = totals.pl >= 0 ? 'pos' : 'neg';
    wrap.appendChild(stat('品种数', String(totals.nvarieties)));
    wrap.appendChild(stat('交易笔数', String(totals.ntrades)));
    wrap.appendChild(stat('开仓手数', Fmt.lots(totals.open)));
    wrap.appendChild(stat('平仓手数', Fmt.lots(totals.close)));
    wrap.appendChild(stat('总盈亏', Fmt.money(totals.pl), plCls));
    el.appendChild(wrap);
  }

  return { render: render };
})();
