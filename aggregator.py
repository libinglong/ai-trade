# -*- coding: utf-8 -*-
"""
aggregator.py
=============
把结构化成交明细（fills）按品种聚合成「一笔笔建仓 -> 清仓」的交易。

口径：
  - 一笔交易：某品种的品种级净持仓从 0 建仓，到最后清仓（手数回到 0）。
  - 移仓：同品种内不同合约切换（近月平仓 + 远月建仓），净持仓未回到 0，
    不算清仓，仍属同一笔交易。
  - 货值 = 成交额；保证金 = 货值 × 保证金率（见 margin_rates.py）。
"""

import datetime as dt
import re
from collections import defaultdict

from margin_rates import margin_rate
from parser import CLOSE_MARKS

# 品种代码 -> 中文名称（可自行增补）
VARIETY_NAMES = {
    'CF': '棉花', 'MA': '甲醇', 'PK': '花生', 'PR': '瓶片', 'SF': '硅铁', 'TA': 'PTA',
    'AL': '铝', 'AO': '氧化铝', 'BU': '沥青', 'CU': '铜', 'EB': '苯乙烯',
    'EG': '乙二醇', 'FU': '燃料油', 'JD': '鸡蛋', 'JM': '焦煤', 'LC': '碳酸锂',
    'LH': '生猪', 'LU': '低硫燃料油', 'M': '豆粕', 'NR': '20号胶', 'P': '棕榈油',
    'PB': '铅', 'PG': '液化石油气', 'PP': '聚丙烯', 'PS': '聚苯乙烯', 'RU': '天然橡胶',
    'SN': '锡', 'V': '聚氯乙烯', 'ZN': '锌',
}


def _natural_key(s):
    """自然排序键：CF609 < CF610 < jd2609（数字按数值比较，字母忽略大小写）。"""
    return [int(part) if part.isdigit() else part.lower()
            for part in re.split(r'(\d+)', str(s))]


def _build_records(fills):
    """相同时间（交易日）+ 相同合约 + 相同点位（及相同买卖/开平）合并为一小条记录。

    记录先按合约自然排序，再按时间从小到大排序。
    """
    index = {}
    order = []
    for f in fills:
        kp_norm = '开' if f['kp'] == '开' else '平'
        key = (f['contract'], f['price'], f['side'], kp_norm, f['date'])
        if key not in index:
            index[key] = {
                'contract': f['contract'],
                'price': f['price'],
                'side': f['side'],
                'kp': kp_norm,
                'date': f['date'],
                'lots': 0.0,
                'pl': 0.0,
            }
            order.append(key)
        index[key]['lots'] += f['lots']
        index[key]['pl'] += f['pl']

    records = [index[k] for k in order]
    records.sort(key=lambda r: (_natural_key(r['contract']), r['date'] or dt.date.min))
    for r in records:
        r['date'] = r['date'].strftime('%Y-%m-%d') if r['date'] else ''
    return records


def _finalize_trade(cur, close_date, rate):
    records = _build_records(cur['fills'])
    open_date = cur['open_date']
    days = (close_date - open_date).days if (open_date and close_date) else 0
    max_value = round(cur['max_value'], 2)
    max_margin = round(max_value * rate, 2)
    return {
        'open_date': open_date.strftime('%Y-%m-%d') if open_date else '',
        'close_date': close_date.strftime('%Y-%m-%d') if close_date else '',
        'days': days,
        'contracts': sorted(cur['contracts'], key=_natural_key),
        'open_lots': cur['open_lots'],
        'close_lots': cur['close_lots'],
        'pl': cur['pl'],
        'max_value': max_value,
        'max_margin': max_margin,
        'margin_ratio': round(max_margin / max_value, 6) if max_value else 0.0,
        'records': records,
    }


def aggregate(fills):
    """把明细聚合成 (varieties, totals)。

    varieties: [{code, name, ntrades, open, close, pl, trades:[...]}]
    每笔 trade: {open_date, close_date, days, contracts, open_lots,
                close_lots, pl, max_value, max_margin, margin_ratio, records:[...]}
    """
    state = defaultdict(lambda: {
        'open': 0.0, 'close': 0.0, 'pl': 0.0,
        'trades': [], 'cur': None, 'pos': 0.0,
    })

    for f in fills:
        variety = f['variety']
        st = state[variety]
        lots = f['lots']

        before = st['pos']
        st['pos'] += lots if f['side'] == '买' else -lots
        after = st['pos']

        if f['kp'] == '开':
            st['open'] += lots
        elif f['kp'] in CLOSE_MARKS:
            st['close'] += lots
            st['pl'] += f['pl']

        # 交易边界：0 -> 非 0 开新一笔；非 0 -> 0 完成一笔
        if before == 0 and after != 0:
            st['cur'] = {'open_date': f['date'], 'fills': [], 'contracts': set(),
                         'open_lots': 0.0, 'close_lots': 0.0, 'pl': 0.0,
                         'value': 0.0, 'max_value': 0.0}

        if st['cur'] is not None:
            cur = st['cur']
            cur['fills'].append(f)
            cur['contracts'].add(f['contract'])
            if f['kp'] == '开':
                cur['open_lots'] += lots
                cur['value'] += f['amount']
            elif f['kp'] in CLOSE_MARKS:
                cur['close_lots'] += lots
                cur['pl'] += f['pl']
                cur['value'] -= f['amount']
            if cur['value'] > cur['max_value']:
                cur['max_value'] = cur['value']

        if before != 0 and after == 0:
            rate = margin_rate(variety)
            st['trades'].append(_finalize_trade(st['cur'], f['date'], rate))
            st['cur'] = None

    varieties = []
    totals = {'nvarieties': 0, 'ntrades': 0, 'open': 0.0, 'close': 0.0, 'pl': 0.0}
    for code in sorted(state):
        st = state[code]
        if not st['trades']:
            continue
        varieties.append({
            'code': code,
            'name': VARIETY_NAMES.get(code, code),
            'ntrades': len(st['trades']),
            'open': st['open'],
            'close': st['close'],
            'pl': st['pl'],
            'trades': sorted(st['trades'], key=lambda t: t['open_date'] or ''),
        })
        totals['nvarieties'] += 1
        totals['ntrades'] += len(st['trades'])
        totals['open'] += st['open']
        totals['close'] += st['close']
        totals['pl'] += st['pl']

    varieties.sort(key=lambda v: -abs(v['pl']))
    return varieties, totals
