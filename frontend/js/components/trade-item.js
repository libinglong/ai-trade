/* 单笔交易组件（details 展开查看成交小条记录） */
window.TradeItem = (function () {
  function render(t) {
    var details = document.createElement('details');
    var summary = document.createElement('summary');

    var plCls = t.pl >= 0 ? 'pos' : 'neg';
    var range = t.open_date + ' → ' + t.close_date;
    var span = t.days === 0 ? range + '（当日）' : range + '（' + t.days + ' 天）';

    var contractTags = t.contracts.map(function (c) {
      return '<span class="contract-tag">' + Fmt.esc(c) + '</span>';
    }).join('');

    summary.innerHTML =
      '<span class="caret-wrap"><span class="caret">▶</span></span>' +
      '<span class="trade-date">' + span + '</span>' +
      '<span class="trade-contracts">' + contractTags + '</span>' +
      '<span class="trade-spacer"></span>' +
      '<span class="trade-meta">开 ' + Fmt.lots(t.open_lots) + ' 手</span>' +
      '<span class="trade-meta">平 ' + Fmt.lots(t.close_lots) + ' 手</span>' +
      '<span class="trade-meta">最大货值 ' + Fmt.wan(t.max_value) + '</span>' +
      '<span class="trade-meta">最大保证金 ' + Fmt.wan(t.max_margin) + '</span>' +
      '<span class="trade-meta">保证金比例 ' + Fmt.pct(t.margin_ratio) + '</span>' +
      '<span class="trade-pl ' + plCls + '">' + Fmt.money(t.pl) + '</span>';
    details.appendChild(summary);

    var detail = document.createElement('div');
    detail.className = 'detail';
    detail.appendChild(RecordTable.render(t.records));
    details.appendChild(detail);

    return details;
  }

  return { render: render };
})();
