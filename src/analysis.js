const QUESTIONS_ANALYSIS = [
  { id: 'q1', title: 'Łatwość rozpoczęcia pracy' },
  { id: 'q2', title: 'Czytelność nawigacji' },
  { id: 'q3', title: 'Wyszukiwanie i filtrowanie' },
  { id: 'q4', title: 'Tworzenie i edycja wiadomości' },
  { id: 'q5', title: 'Zarządzanie skrzynką' },
  { id: 'q6', title: 'Widoczność statusu' },
  { id: 'q7', title: 'Wydajność i szybkość' },
  { id: 'q8', title: 'Ogólna satysfakcja' }
];

const CHART_COLORS = {
  gmail: '#ff6a3d',
  outlook: '#0d8f8d',
  tie: '#999999'
};

const AGE_GROUP_COLORS = ['#4e79a7', '#59a14f', '#edc948', '#f28e2b', '#e15759'];

const AGE_GROUPS = [
  { label: '15–25', min: 15, max: 25 },
  { label: '26–35', min: 26, max: 35 },
  { label: '36–44', min: 36, max: 44 },
  { label: '45–60', min: 45, max: 60 }
];

const appConfig = window.APP_CONFIG || null;
const hasSupabaseConfig = Boolean(
  appConfig?.supabaseUrl
  && appConfig?.supabaseAnonKey
  && !appConfig.supabaseUrl.includes('twoj-projekt')
  && !appConfig.supabaseAnonKey.includes('twoj_anon_key')
);

let supabaseClient = null;
if (hasSupabaseConfig) {
  try {
    supabaseClient = window.supabase.createClient(appConfig.supabaseUrl, appConfig.supabaseAnonKey);
  } catch (_) {
    supabaseClient = null;
  }
}

let activeCharts = [];

function destroyCharts() {
  activeCharts.forEach(c => c.destroy());
  activeCharts = [];
}

function computeMeans(data) {
  return QUESTIONS_ANALYSIS.map((q, i) => {
    const gmailVals = data.map(d => d[`${q.id}_gmail`]).filter(v => v != null && !isNaN(v));
    const outlookVals = data.map(d => d[`${q.id}_outlook`]).filter(v => v != null && !isNaN(v));
    return {
      id: q.id,
      title: q.title,
      gmailMean: gmailVals.length ? gmailVals.reduce((a, b) => a + b, 0) / gmailVals.length : 0,
      outlookMean: outlookVals.length ? outlookVals.reduce((a, b) => a + b, 0) / outlookVals.length : 0,
      gmailCount: gmailVals.length,
      outlookCount: outlookVals.length
    };
  });
}

function renderStats(container, data) {
  container.style.display = 'flex';
  const gmailWins = data.filter(d => d.overall_preference === 'gmail').length;
  const outlookWins = data.filter(d => d.overall_preference === 'outlook').length;
  const ties = data.filter(d => d.overall_preference === 'remis').length;

  container.innerHTML = `
    <div class="stat">Odpowiedzi: <strong>${data.length}</strong></div>
    <div class="stat">Gmail: <strong>${gmailWins}</strong></div>
    <div class="stat">Outlook: <strong>${outlookWins}</strong></div>
    <div class="stat">Remis: <strong>${ties}</strong></div>
  `;
}

function renderComparisonChart(data) {
  const means = computeMeans(data);
  const ctx = document.getElementById('chartComparison').getContext('2d');

  activeCharts.push(new Chart(ctx, {
    type: 'bar',
    data: {
      labels: means.map((m, i) => `Q${i + 1}`),
      datasets: [
        {
          label: 'Gmail',
          data: means.map(m => +m.gmailMean.toFixed(2)),
          backgroundColor: CHART_COLORS.gmail,
          borderRadius: 6
        },
        {
          label: 'Outlook',
          data: means.map(m => +m.outlookMean.toFixed(2)),
          backgroundColor: CHART_COLORS.outlook,
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Porównanie średnich ocen: Gmail vs Outlook',
          font: { family: "'Space Grotesk', sans-serif", size: 15, weight: '700' }
        },
        tooltip: {
          callbacks: {
            afterLabel: (ctx) => {
              const m = means[ctx.dataIndex];
              const platform = ctx.dataset.label.toLowerCase();
              return `n = ${platform === 'gmail' ? m.gmailCount : m.outlookCount}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 10,
          title: { display: true, text: 'Średnia ocena' }
        }
      }
    }
  }));
}

function renderPerQuestionCharts(data) {
  const means = computeMeans(data);

  for (let i = 0; i < QUESTIONS_ANALYSIS.length; i++) {
    const m = means[i];
    const canvas = document.getElementById(`chartQ${i + 1}`);
    if (!canvas) continue;
    const ctx = canvas.getContext('2d');

    activeCharts.push(new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Gmail', 'Outlook'],
        datasets: [{
          data: [+m.gmailMean.toFixed(2), +m.outlookMean.toFixed(2)],
          backgroundColor: [CHART_COLORS.gmail, CHART_COLORS.outlook],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `Q${i + 1}: ${m.title}`,
            font: { family: "'Space Grotesk', sans-serif", size: 13, weight: '700' }
          },
          legend: { display: false },
          tooltip: {
            callbacks: {
              afterLabel: (ctx) => `n = ${ctx.dataIndex === 0 ? m.gmailCount : m.outlookCount}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 10,
            title: { display: true, text: 'Średnia' }
          }
        }
      }
    }));
  }
}

function renderPreferenceCharts(data) {
  const counts = { gmail: 0, outlook: 0, remis: 0 };
  data.forEach(d => {
    if (counts[d.overall_preference] !== undefined) {
      counts[d.overall_preference]++;
    }
  });

  const labels = ['Gmail', 'Outlook', 'Remis'];
  const values = [counts.gmail, counts.outlook, counts.remis];
  const colors = [CHART_COLORS.gmail, CHART_COLORS.outlook, CHART_COLORS.tie];

  const ctxBar = document.getElementById('chartPrefBar').getContext('2d');
  activeCharts.push(new Chart(ctxBar, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Preferencja końcowa',
          font: { family: "'Space Grotesk', sans-serif", size: 14, weight: '700' }
        },
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 },
          title: { display: true, text: 'Liczba odpowiedzi' }
        }
      }
    }
  }));

  const ctxPie = document.getElementById('chartPrefPie').getContext('2d');
  activeCharts.push(new Chart(ctxPie, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: '#fffdf9'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Rozkład preferencji',
          font: { family: "'Space Grotesk', sans-serif", size: 14, weight: '700' }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const total = values.reduce((a, b) => a + b, 0);
              const pct = total ? ((ctx.raw / total) * 100).toFixed(1) : 0;
              return `${ctx.label}: ${ctx.raw} (${pct}%)`;
            }
          }
        }
      }
    }
  }));
}

function getAgeGroup(age) {
  for (const g of AGE_GROUPS) {
    if (age >= g.min && age <= g.max) return g.label;
  }
  return 'Inne';
}

function groupByAge(data) {
  const groups = {};
  AGE_GROUPS.forEach(g => { groups[g.label] = []; });
  data.forEach(d => {
    const label = getAgeGroup(d.age || 0);
    if (!groups[label]) groups[label] = [];
    groups[label].push(d);
  });
  return groups;
}

function renderCompletenessStats(container, data) {
  const countAnswers = (d) => {
    let n = 0;
    for (let i = 1; i <= 8; i++) {
      if (d[`q${i}_gmail`] != null || d[`q${i}_outlook`] != null) n++;
    }
    return n;
  };
  const full = data.filter(d => countAnswers(d) === 8).length;
  const half = data.filter(d => { const n = countAnswers(d); return n >= 4 && n < 8; }).length;
  const partial = data.filter(d => { const n = countAnswers(d); return n >= 1 && n < 4; }).length;
  const none = data.filter(d => countAnswers(d) === 0).length;

  container.style.display = 'flex';
  container.innerHTML = `
    <div class="stat">Pełne (8 pytań): <strong>${full}</strong></div>
    <div class="stat">Połowa (4-7): <strong>${half}</strong></div>
    <div class="stat">Częściowe (1-3): <strong>${partial}</strong></div>
    <div class="stat">Brak pytań: <strong>${none}</strong></div>
  `;
}

function renderAgeDistribution(data) {
  const counts = AGE_GROUPS.map(g => data.filter(d => {
    const age = d.age || 0;
    return age >= g.min && age <= g.max;
  }).length);

  const ctx = document.getElementById('chartAgeDistribution').getContext('2d');
  activeCharts.push(new Chart(ctx, {
    type: 'bar',
    data: {
      labels: AGE_GROUPS.map(g => g.label),
      datasets: [{
        label: 'Liczba respondentów',
        data: counts,
        backgroundColor: AGE_GROUP_COLORS,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Rozkład wieku respondentów',
          font: { family: "'Space Grotesk', sans-serif", size: 14, weight: '700' }
        },
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 },
          title: { display: true, text: 'Liczba' }
        }
      }
    }
  }));
}

function renderAgeComparison(data) {
  const grouped = groupByAge(data);
  const activeGroups = AGE_GROUPS.filter(g => grouped[g.label] && grouped[g.label].length > 0);
  const labels = activeGroups.map(g => g.label);

  const gmailMeans = activeGroups.map(g => {
    const vals = grouped[g.label].map(d => d.q1_gmail).filter(v => v != null && !isNaN(v));
    const allVals = [];
    QUESTIONS_ANALYSIS.forEach(q => {
      grouped[g.label].forEach(d => {
        const v = d[`${q.id}_gmail`];
        if (v != null && !isNaN(v)) allVals.push(v);
      });
    });
    return allVals.length ? +(allVals.reduce((a, b) => a + b, 0) / allVals.length).toFixed(2) : 0;
  });

  const outlookMeans = activeGroups.map(g => {
    const allVals = [];
    QUESTIONS_ANALYSIS.forEach(q => {
      grouped[g.label].forEach(d => {
        const v = d[`${q.id}_outlook`];
        if (v != null && !isNaN(v)) allVals.push(v);
      });
    });
    return allVals.length ? +(allVals.reduce((a, b) => a + b, 0) / allVals.length).toFixed(2) : 0;
  });

  const ctx = document.getElementById('chartAgeComparison').getContext('2d');
  activeCharts.push(new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Gmail',
          data: gmailMeans,
          backgroundColor: CHART_COLORS.gmail,
          borderRadius: 6
        },
        {
          label: 'Outlook',
          data: outlookMeans,
          backgroundColor: CHART_COLORS.outlook,
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Średnia ocen Gmail vs Outlook wg grupy wiekowej',
          font: { family: "'Space Grotesk', sans-serif", size: 14, weight: '700' }
        },
        tooltip: {
          callbacks: {
            afterLabel: (ctx) => {
              const g = activeGroups[ctx.dataIndex];
              return `n = ${grouped[g.label].length}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 10,
          title: { display: true, text: 'Średnia ocena' }
        }
      }
    }
  }));
}

function renderAgePreference(data) {
  const grouped = groupByAge(data);
  const activeGroups = AGE_GROUPS.filter(g => grouped[g.label] && grouped[g.label].length > 0);

  const gmailData = activeGroups.map(g => grouped[g.label].filter(d => d.overall_preference === 'gmail').length);
  const outlookData = activeGroups.map(g => grouped[g.label].filter(d => d.overall_preference === 'outlook').length);
  const remisData = activeGroups.map(g => grouped[g.label].filter(d => d.overall_preference === 'remis').length);

  const ctx = document.getElementById('chartAgePreference').getContext('2d');
  activeCharts.push(new Chart(ctx, {
    type: 'bar',
    data: {
      labels: activeGroups.map(g => g.label),
      datasets: [
        { label: 'Gmail', data: gmailData, backgroundColor: CHART_COLORS.gmail, borderRadius: 4 },
        { label: 'Outlook', data: outlookData, backgroundColor: CHART_COLORS.outlook, borderRadius: 4 },
        { label: 'Remis', data: remisData, backgroundColor: CHART_COLORS.tie, borderRadius: 4 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Preferencja końcowa wg grupy wiekowej',
          font: { family: "'Space Grotesk', sans-serif", size: 14, weight: '700' }
        }
      },
      scales: {
        x: { stacked: true },
        y: {
          stacked: true,
          beginAtZero: true,
          ticks: { stepSize: 1 },
          title: { display: true, text: 'Liczba odpowiedzi' }
        }
      }
    }
  }));
}

async function loadAnalysis() {
  const statusEl = document.getElementById('analysisStatus');
  const statsContainer = document.getElementById('statsContainer');

  if (!hasSupabaseConfig || !supabaseClient) {
    statusEl.textContent = 'Brak konfiguracji Supabase. Uzupełnij config.js, aby wyświetlić analizę.';
    return;
  }

  statusEl.textContent = 'Ładowanie danych...';
  destroyCharts();

  try {
    const { data, error } = await supabaseClient
      .from('survey_responses')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) {
      statusEl.textContent = 'Brak danych w bazie.';
      statsContainer.style.display = 'none';
      return;
    }

    statusEl.textContent = '';
    renderStats(statsContainer, data);
    renderComparisonChart(data);
    renderPerQuestionCharts(data);
    renderPreferenceCharts(data);
    renderAgeDistribution(data);
    renderAgeComparison(data);
    renderAgePreference(data);

    const compStats = document.getElementById('completenessStats');
    if (compStats) renderCompletenessStats(compStats, data);
  } catch (err) {
    const hint = err.message.includes('Failed to fetch')
      ? ' — uruchom serwer lokalnie: npm run dev lub python3 -m http.server w katalogu src/'
      : '';
    statusEl.textContent = `Błąd ładowania danych: ${err.message}${hint}`;
    statsContainer.style.display = 'none';
  }
}

document.getElementById('refreshBtn').addEventListener('click', loadAnalysis);

loadAnalysis();
