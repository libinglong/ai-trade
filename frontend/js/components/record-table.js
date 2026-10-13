/* 单笔交易的成交小条记录表组件 */
window.RecordTable = (function () {
  function render(records) {
    var table = document.createElement('table');
    table.className = 'detail-table';

    var thead = document.createElement('thead');
    thead.innerHTML = '<tr><th>合约</th><th>时间</th><th class="num">成交价</th>' +
      '<th>买卖</th><th>开平</th><th class="num">手数</th><th class="num">盈亏</th></tr>';
    table.appendChild(thead);

    var tbody = document.createElement('tbody');
    records.forEach(function (r) {
      var tr = document.createElement('tr');
      var isClose = r.kp === '平';
      var plText = isClose ? Fmt.money(r.pl) : '—';
      var plCls = isClose ? (r.pl >= 0 ? 'pos' : 'neg') : '';
      var kpBadge = r.kp === '开' ? 'open' : 'close';
      var sideBadge = r.side === '买' ? 'buy' : 'sell';
      tr.innerHTML =
        '<td>' + Fmt.esc(r.contract) + '</td>' +
        '<td>' + Fmt.dateMMDD(r.date) + '</td>' +
        '<td class="num">' + Fmt.esc(r.price) + '</td>' +
        '<td><span class="badge ' + sideBadge + '">' + Fmt.esc(r.side) + '</span></td>' +
        '<td><span class="badge ' + kpBadge + '">' + Fmt.esc(r.kp) + '</span></td>' +
        '<td class="num">' + Fmt.lots(r.lots) + '</td>' +
        '<td class="num ' + plCls + '">' + plText + '</td>';
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    return table;
  }

  return { render: render };
})();
