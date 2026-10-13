# -*- coding: utf-8 -*-
"""
reporter.py
===========
把聚合结果渲染成单个自包含的 HTML 报告文件。

前端组件放在 frontend/ 目录下（一个组件一个文件）：
  js/format.js                  格式化工具
  js/components/stat-cards.js   顶部统计卡片
  js/components/summary-table.js 品种汇总表
  js/components/trade-list.js   交易明细列表
  js/components/trade-item.js   单笔交易
  js/components/record-table.js 单笔交易的成交小条记录
  js/app.js                     入口

本模块把这些源文件内联进一个 HTML，方便双击直接打开。
"""

import json
from pathlib import Path

FRONTEND_DIR = Path(__file__).resolve().parent / 'frontend'

# 依赖顺序：工具 -> 组件 -> 入口
JS_FILES = [
    'js/format.js',
    'js/components/stat-cards.js',
    'js/components/summary-table.js',
    'js/components/trade-list.js',
    'js/components/trade-item.js',
    'js/components/record-table.js',
    'js/app.js',
]


def _read(name):
    return (FRONTEND_DIR / name).read_text(encoding='utf-8')


def build_html(varieties, totals, src_name):
    """把数据 + 前端源文件拼成一个自包含的 HTML 字符串。"""
    template = _read('index.html')
    css = _read('css/style.css')
    js = '\n'.join(_read(name) for name in JS_FILES)

    data = {'source': src_name, 'totals': totals, 'varieties': varieties}
    # 防止数据里出现 </script> 破坏 HTML 结构
    data_json = json.dumps(data, ensure_ascii=False).replace('</', '<\\/')

    return (template
            .replace('@CSS@', css)
            .replace('@DATA@', data_json)
            .replace('@JS@', js))


def write_report(varieties, totals, src_name, out_path):
    out_path = Path(out_path)
    out_path.write_text(build_html(varieties, totals, src_name), encoding='utf-8')
    return out_path
