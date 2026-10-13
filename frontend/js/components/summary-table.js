/* 品种汇总表组件 */
window.SummaryTable = (function () {
  function render(el, varieties, totals) {
    var section = document.createElement('section');
    section.className = 'section';
    var h2 = document.createElement('h2');
    h2.className = 'section-title';
    h2.textContent = '品种汇总';
    section.appendChild(h2);

    var table = document.createElement('table');
    var thead = document.createElement('thead');
    thead.innerHTML = '<tr><th>品种</th><th>品种名称</th><th class="num">交易笔数</th>' +
      '<th class="num">开仓手数</th><th class="num">平仓手数</th><th class="num">盈亏</th></tr>';
    table.appendChild(thead);

    var tbody = document.createElement('tbody');
    varieties.forEach(function (v) {
      var tr = document.createElement('tr');
      var plCls = v.pl >= 0 ? 'pos' : 'neg';
      tr.innerHTML = '<td>' + Fmt.esc(v.code) + '</td><td>' + Fmt.esc(v.name) + '</td>' +
        '<td class="num">' + v.ntrades + '</td>' +
        '<td class="num">' + Fmt.lots(v.open) + '</td>' +
        '<td class="num">' + Fmt.lots(v.close) + '</td>' +
        '<td class="num ' + plCls + '">' + Fmt.money(v.pl) + '</td>';
      tbody.appendChild(tr);
    });

    var trTotal = document.createElement('tr');
    trTotal.className = 'total';
    var totalPlCls = totals.pl >= 0 ? 'pos' : 'neg';
    trTotal.innerHTML = '<td>合计</td><td></td>' +
      '<td class="num">' + totals.ntrades + '</td>' +
      '<td class="num">' + Fmt.lots(totals.open) + '</td>' +
      '<td class="num">' + Fmt.lots(totals.close) + '</td>' +
      '<td class="num ' + totalPlCls + '">' + Fmt.money(totals.pl) + '</td>';
    tbody.appendChild(trTotal);

    table.appendChild(tbody);

    var tableWrap = document.createElement('div');
    tableWrap.className = 'table-wrap';
    tableWrap.appendChild(table);
    section.appendChild(tableWrap);

    el.appendChild(section);
  }

  return { render: render };
})();
