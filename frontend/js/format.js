/* 格式化与转义工具：统一在 UI 层做展示格式化 */
window.Fmt = (function () {
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function lots(v) {
    var n = Number(v) || 0;
    if (Math.abs(n - Math.round(n)) < 1e-9) return String(Math.round(n));
    return n.toFixed(2);
  }

  // 带正负号、千分位的金额，如 +1,234.50 / -1,234.50 / 0.00
  function money(v) {
    var n = Number(v) || 0;
    if (Math.abs(n) < 1e-9) return '0.00';
    var parts = Math.abs(n).toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (n < 0 ? '-' : '+') + parts[0] + '.' + parts[1];
  }

  // 以万为单位、保留两位小数，如 12.35万
  function wan(v) {
    var n = Number(v) || 0;
    var s = (n / 10000).toFixed(2);
    s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return s + '万';
  }

  // 小数比例 -> 百分比，如 0.09 -> 9.00%
  function pct(v) {
    return (Number(v) * 100).toFixed(2) + '%';
  }

  // '2026-07-02' -> '07-02'
  function dateMMDD(s) {
    return s ? String(s).slice(5) : '';
  }

  return { esc: esc, lots: lots, money: money, wan: wan, pct: pct, dateMMDD: dateMMDD };
})();
