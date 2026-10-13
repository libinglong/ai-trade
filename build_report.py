# -*- coding: utf-8 -*-
"""
build_report.py
===============
入口：读取 7-9 月成交记录 Excel，生成同名 HTML 报告。

用法：
    python build_report.py "2026 7-9月成交.xlsx"
    python build_report.py            # 不传参时自动取当前目录下第一个 .xlsx
"""

import sys
from pathlib import Path

from parser import parse_excel
from aggregator import aggregate
from reporter import write_report


def _fmt_money(v):
    return '0.00' if abs(v) < 1e-9 else f'{v:+,.2f}'


def main(argv=None):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
    if argv is None:
        argv = sys.argv[1:]

    if argv:
        path = argv[0]
    else:
        cands = [p for p in Path('.').glob('*.xlsx') if not p.name.startswith('~$')]
        if not cands:
            print('未找到 Excel 文件。用法：python build_report.py "成交记录.xlsx"')
            return 1
        path = str(cands[0])

    src = Path(path)
    fills = parse_excel(src)
    varieties, totals = aggregate(fills)

    out_path = src.with_name(src.stem + '.html')
    write_report(varieties, totals, src.name, out_path)

    print(f'品种 {totals["nvarieties"]} 个，交易 {totals["ntrades"]} 笔，'
          f'总盈亏 {_fmt_money(totals["pl"])}')
    print(f'已生成报告：{out_path}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
