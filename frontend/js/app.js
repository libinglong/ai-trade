/* 入口：读取数据并渲染各组件 */
(function () {
  function boot() {
    var data = window.REPORT_DATA;

    var src = document.getElementById('src-name');
    if (src) src.textContent = data.source;

    StatCards.render(document.getElementById('stat-cards'), data.totals);
    SummaryTable.render(document.getElementById('summary-table'), data.varieties, data.totals);
    TradeList.render(document.getElementById('trade-list'), data.varieties);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
