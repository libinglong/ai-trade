/* 交易明细列表组件（按品种分组） */
window.TradeList = (function () {
  function render(el, varieties) {
    var card = document.createElement('div');
    card.className = 'card';
    var h2 = document.createElement('h2');
    h2.textContent = '交易明细（点击查看详情）';
    card.appendChild(h2);

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
          '<span>交易 ' + v.ntrades + ' 笔</span>' +
          '<span>开 ' + Fmt.lots(v.open) + ' 手</span>' +
          '<span>平 ' + Fmt.lots(v.close) + ' 手</span>' +
          '<span class="' + plCls + '">盈亏 ' + Fmt.money(v.pl) + '</span>' +
        '</span>';
      block.appendChild(head);

      v.trades.forEach(function (t) {
        block.appendChild(TradeItem.render(t));
      });

      card.appendChild(block);
    });

    el.appendChild(card);
  }

  return { render: render };
})();
