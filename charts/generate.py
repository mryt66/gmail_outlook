#!/usr/bin/env python3
"""
Generowanie wykresów do folderu charts/.
Pobiera dane z Supabase REST API i zapisuje PNG.
"""

import json
import os
import urllib.request

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_ANON_KEY')
CHARTS_DIR = os.path.dirname(__file__)

COLORS = {
    'gmail': '#ff6a3d',
    'outlook': '#0d8f8d',
    'tie': '#999999',
}
AGE_GROUP_COLORS = ['#4e79a7', '#59a14f', '#edc948', '#f28e2b', '#e15759']

QUESTIONS = [
    ('q1', 'Łatwość rozpoczęcia pracy'),
    ('q2', 'Czytelność nawigacji'),
    ('q3', 'Wyszukiwanie i filtrowanie'),
    ('q4', 'Tworzenie i edycja wiadomości'),
    ('q5', 'Zarządzanie skrzynką'),
    ('q6', 'Widoczność statusu'),
    ('q7', 'Wydajność i szybkość'),
    ('q8', 'Ogólna satysfakcja'),
]

AGE_GROUPS = [
    ('15–25', 15, 25),
    ('26–35', 26, 35),
    ('36–44', 36, 44),
    ('45–60', 45, 60),
]


def fetch_data():
    url = f'{SUPABASE_URL}/rest/v1/survey_responses?select=*&order=created_at'
    req = urllib.request.Request(url, headers={
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
    })
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())


def save(fig, name):
    path = os.path.join(CHARTS_DIR, name)
    fig.savefig(path, dpi=150, bbox_inches='tight', facecolor='white')
    plt.close(fig)
    print(f'  Zapisano: {name}')


def chart_comparison(data):
    fig, ax = plt.subplots(figsize=(12, 6))
    x = np.arange(len(QUESTIONS))
    w = 0.35
    gmail_means = []
    outlook_means = []
    for qid, _ in QUESTIONS:
        gv = [d[f'{qid}_gmail'] for d in data if d.get(f'{qid}_gmail') is not None]
        ov = [d[f'{qid}_outlook'] for d in data if d.get(f'{qid}_outlook') is not None]
        gmail_means.append(np.mean(gv) if gv else 0)
        outlook_means.append(np.mean(ov) if ov else 0)

    bars1 = ax.bar(x - w/2, gmail_means, w, label='Gmail', color=COLORS['gmail'])
    bars2 = ax.bar(x + w/2, outlook_means, w, label='Outlook', color=COLORS['outlook'])
    ax.set_xticks(x)
    ax.set_xticklabels([f'Q{i+1}' for i in range(8)])
    ax.set_ylim(0, 10.5)
    ax.set_ylabel('Średnia ocena')
    ax.set_title('Porównanie średnich ocen: Gmail vs Outlook', fontsize=14, fontweight='bold')
    ax.legend()

    for bars in [bars1, bars2]:
        for bar in bars:
            h = bar.get_height()
            if h > 0:
                ax.text(bar.get_x() + bar.get_width()/2, h + 0.15,
                        f'{h:.2f}', ha='center', va='bottom', fontsize=8)

    save(fig, '01_comparison.png')


def chart_per_question(data):
    fig, axes = plt.subplots(2, 4, figsize=(16, 8))
    fig.suptitle('Średnie ocen per pytanie', fontsize=16, y=1.02)
    for i, (qid, title) in enumerate(QUESTIONS):
        ax = axes[i // 4][i % 4]
        gv = [d[f'{qid}_gmail'] for d in data if d.get(f'{qid}_gmail') is not None]
        ov = [d[f'{qid}_outlook'] for d in data if d.get(f'{qid}_outlook') is not None]
        gm = np.mean(gv) if gv else 0
        om = np.mean(ov) if ov else 0
        bars = ax.bar(['Gmail', 'Outlook'], [gm, om],
                      color=[COLORS['gmail'], COLORS['outlook']], width=0.5)
        ax.set_ylim(0, 10.5)
        ax.set_title(f'Q{i+1}: {title}', fontsize=10, fontweight='bold')
        for bar in bars:
            h = bar.get_height()
            if h > 0:
                ax.text(bar.get_x() + bar.get_width()/2, h + 0.15,
                        f'{h:.2f}', ha='center', va='bottom', fontsize=8)
    plt.tight_layout()
    save(fig, '02_per_question.png')


def chart_preference(data):
    counts = {'gmail': 0, 'outlook': 0, 'remis': 0}
    for d in data:
        p = d.get('overall_preference', '')
        if p in counts:
            counts[p] += 1

    labels = ['Gmail', 'Outlook', 'Remis']
    values = [counts['gmail'], counts['outlook'], counts['remis']]
    colors = [COLORS['gmail'], COLORS['outlook'], COLORS['tie']]

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))
    bars = ax1.bar(labels, values, color=colors)
    ax1.set_ylabel('Liczba odpowiedzi')
    ax1.set_title('Preferencja końcowa', fontsize=14, fontweight='bold')
    for bar in bars:
        h = bar.get_height()
        if h > 0:
            ax1.text(bar.get_x() + bar.get_width()/2, h + 0.1,
                     str(int(h)), ha='center', va='bottom', fontweight='bold')

    nonzero = [(l, v, c) for l, v, c in zip(labels, values, colors) if v > 0]
    if nonzero:
        nl, nv, nc = zip(*nonzero)
        ax2.pie(nv, labels=nl, autopct='%1.1f%%', colors=nc, startangle=90,
                textprops={'fontsize': 12})
    ax2.set_title('Rozkład preferencji', fontsize=14, fontweight='bold')

    plt.tight_layout()
    save(fig, '03_preference.png')


def chart_age_distribution(data):
    ages = [d.get('age', 0) for d in data]
    counts = []
    for label, lo, hi in AGE_GROUPS:
        counts.append(sum(1 for a in ages if lo <= a <= hi))

    fig, ax = plt.subplots(figsize=(10, 5))
    bars = ax.bar([g[0] for g in AGE_GROUPS], counts, color=AGE_GROUP_COLORS[:len(AGE_GROUPS)])
    ax.set_ylabel('Liczba respondentów')
    ax.set_title('Rozkład wieku respondentów', fontsize=14, fontweight='bold')
    for bar in bars:
        h = bar.get_height()
        if h > 0:
            ax.text(bar.get_x() + bar.get_width()/2, h + 0.1,
                    str(int(h)), ha='center', va='bottom', fontweight='bold')
    save(fig, '04_age_distribution.png')


def chart_age_comparison(data):
    grouped = {g[0]: [] for g in AGE_GROUPS}
    for d in data:
        age = d.get('age', 0)
        for label, lo, hi in AGE_GROUPS:
            if lo <= age <= hi:
                grouped[label].append(d)
                break

    active = [(g[0], grouped[g[0]]) for g in AGE_GROUPS if grouped[g[0]]]
    if not active:
        return

    labels = [a[0] for a in active]
    gmail_all = []
    outlook_all = []
    for _, recs in active:
        gv = [d[f'{q}_gmail'] for d in recs for q, _ in QUESTIONS if d.get(f'{q}_gmail') is not None]
        ov = [d[f'{q}_outlook'] for d in recs for q, _ in QUESTIONS if d.get(f'{q}_outlook') is not None]
        gmail_all.append(np.mean(gv) if gv else 0)
        outlook_all.append(np.mean(ov) if ov else 0)

    x = np.arange(len(labels))
    w = 0.35
    fig, ax = plt.subplots(figsize=(10, 5))
    bars1 = ax.bar(x - w/2, gmail_all, w, label='Gmail', color=COLORS['gmail'])
    bars2 = ax.bar(x + w/2, outlook_all, w, label='Outlook', color=COLORS['outlook'])
    ax.set_xticks(x)
    ax.set_xticklabels(labels)
    ax.set_ylim(0, 10.5)
    ax.set_ylabel('Średnia ocena')
    ax.set_title('Średnie ocen Gmail vs Outlook wg grupy wiekowej', fontsize=14, fontweight='bold')
    ax.legend()

    for bars in [bars1, bars2]:
        for bar in bars:
            h = bar.get_height()
            if h > 0:
                ax.text(bar.get_x() + bar.get_width()/2, h + 0.15,
                        f'{h:.2f}', ha='center', va='bottom', fontsize=8)

    save(fig, '05_age_comparison.png')


def chart_age_preference(data):
    grouped = {g[0]: [] for g in AGE_GROUPS}
    for d in data:
        age = d.get('age', 0)
        for label, lo, hi in AGE_GROUPS:
            if lo <= age <= hi:
                grouped[label].append(d)
                break

    active = [(g[0], grouped[g[0]]) for g in AGE_GROUPS if grouped[g[0]]]
    if not active:
        return

    labels = [a[0] for a in active]
    gmail_d = [sum(1 for d in recs if d.get('overall_preference') == 'gmail') for _, recs in active]
    outlook_d = [sum(1 for d in recs if d.get('overall_preference') == 'outlook') for _, recs in active]
    remis_d = [sum(1 for d in recs if d.get('overall_preference') == 'remis') for _, recs in active]

    x = np.arange(len(labels))
    fig, ax = plt.subplots(figsize=(10, 5))
    ax.bar(x, gmail_d, label='Gmail', color=COLORS['gmail'])
    ax.bar(x, outlook_d, bottom=gmail_d, label='Outlook', color=COLORS['outlook'])
    ax.bar(x, remis_d, bottom=[g+o for g, o in zip(gmail_d, outlook_d)],
           label='Remis', color=COLORS['tie'])
    ax.set_xticks(x)
    ax.set_xticklabels(labels)
    ax.set_ylabel('Liczba odpowiedzi')
    ax.set_title('Preferencja końcowa wg grupy wiekowej', fontsize=14, fontweight='bold')
    ax.legend()

    save(fig, '06_age_preference.png')


def chart_completeness(data):
    full = half = partial = 0
    for d in data:
        answered = sum(1 for i in range(1, 9) if d.get(f'q{i}_gmail') is not None)
        if answered == 8:
            full += 1
        elif 4 <= answered < 8:
            half += 1
        elif 1 <= answered < 4:
            partial += 1

    labels = ['Pełne (8)', 'Połowa (4-7)', 'Częściowe (1-3)']
    values = [full, half, partial]
    colors = ['#59a14f', '#edc948', '#e15759']

    fig, ax = plt.subplots(figsize=(8, 5))
    bars = ax.bar(labels, values, color=colors)
    ax.set_ylabel('Liczba odpowiedzi')
    ax.set_title('Kompletność odpowiedzi', fontsize=14, fontweight='bold')
    for bar in bars:
        h = bar.get_height()
        if h > 0:
            ax.text(bar.get_x() + bar.get_width()/2, h + 0.1,
                    str(int(h)), ha='center', va='bottom', fontweight='bold')

    save(fig, '07_completeness.png')


def main():
    print(f'Pobieranie danych z {SUPABASE_URL}...')
    data = fetch_data()
    print(f'Pobrano {len(data)} odpowiedzi.\n')

    print('Generowanie wykresów...')
    chart_comparison(data)
    chart_per_question(data)
    chart_preference(data)
    chart_age_distribution(data)
    chart_age_comparison(data)
    chart_age_preference(data)
    chart_completeness(data)
    print(f'\nGotowe. Wykresy w {CHARTS_DIR}/')


if __name__ == '__main__':
    main()
