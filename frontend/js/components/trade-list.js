/* 交易明细列表组件（按品种分组） */
window.TradeList = (function () {
  function render(el, varieties) {
    var section = document.createElement('section');
    section.className = 'section';
    var h2 = document.createElement('h2');
    h2.className = 'section-title';
    h2.textContent = '交易明细（点击展开）';
    section.appendChild(h2);

    varieties.forEach(function (v) {
      var block = document.createElement('div');
      block.className = 'variety-block';

      var head = document.createElement('div');
      head.className = 'variety-head';
      var plCls = v.pl >= 0 ? 'pos' : 'neg';
      head.innerHTML =
        '<span class="vname">' + Fmt.esc(v.name) + '</span>' +
        '<span class="vcode">' + Fmt.esc(v.code) + '</span>' +
        '<span class="vmeta">' +
          '<span>交易 <span class="num">' + v.ntrades + '</span> 笔</span>' +
          '<span>开 <span class="num">' + Fmt.lots(v.open) + '</span> 手</span>' +
          '<span>平 <span class="num">' + Fmt.lots(v.close) + '</span> 手</span>' +
          '<span class="' + plCls + '">盈亏 ' + Fmt.money(v.pl) + '</span>' +
        '</span>';
      block.appendChild(head);

      v.trades.forEach(function (t) {
        block.appendChild(TradeItem.render(t));
      });

      section.appendChild(block);
    });

    el.appendChild(section);
  }

  return { render: render };
})();
