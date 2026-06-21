const QUESTIONS = [
  {
    id: 'q1',
    title: 'Łatwość rozpoczęcia pracy',
    instruction: 'Oceń, jak szybko i intuicyjnie da się rozpocząć realizację zadania po wejściu do interfejsu.'
  },
  {
    id: 'q2',
    title: 'Czytelność nawigacji i układu',
    instruction: 'Porównaj, czy struktura widoków, etykiety i rozmieszczenie elementów prowadzą użytkownika bez zgadywania.'
  },
  {
    id: 'q3',
    title: 'Wyszukiwanie i filtrowanie wiadomości',
    instruction: 'Uwzględnij precyzję wyników, łatwość użycia filtrów oraz czas dojścia do właściwej wiadomości.'
  },
  {
    id: 'q4',
    title: 'Tworzenie i edycja wiadomości',
    instruction: 'Sprawdź komfort pisania, formatowania, dodawania odbiorców i załączników oraz poprawiania treści.'
  },
  {
    id: 'q5',
    title: 'Zarządzanie skrzynką',
    instruction: 'Oceń działania na wiadomościach: oznaczanie, przenoszenie, archiwizacja, etykiety/foldery, masowe operacje.'
  },
  {
    id: 'q6',
    title: 'Widoczność statusu i informacji zwrotnej',
    instruction: 'Zwróć uwagę, czy system jasno komunikuje wynik akcji: wysłano, zapisano, błąd, synchronizacja itp.'
  },
  {
    id: 'q7',
    title: 'Wydajność i szybkość interakcji',
    instruction: 'Uwzględnij responsywność interfejsu i płynność podczas realizacji typowych zadań.'
  },
  {
    id: 'q8',
    title: 'Ogólna satysfakcja z doświadczenia',
    instruction: 'Podsumuj całościowe odczucie pracy z platformą po wykonaniu wszystkich zadań testowych.'
  }
];

const SCALE_DEFAULT_MAX = 10;

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

function getQuestionScaleMax(question) {
  return Number(question.scaleMax || SCALE_DEFAULT_MAX);
}

function makeDotScale(name, maxValue) {
  const dots = [];
  for (let value = 1; value <= maxValue; value += 1) {
    dots.push(`
      <label class="dot-option" title="${value}">
        <input type="radio" name="${name}" value="${value}" />
        <span class="dot"></span>
        <span class="dot-number">${value}</span>
      </label>
    `);
  }
  return dots.join('');
}

function renderQuestions() {
  const questionContainer = document.getElementById('questionContainer');
  questionContainer.innerHTML = QUESTIONS.map((question, index) => `
    <article class="question" style="animation-delay: ${index * 70}ms">
      <h3>${index + 1}. ${question.title}</h3>
      <details class="instructions">
        <summary>Instrukcja do pytania</summary>
        <p>${question.instruction}</p>
      </details>
      <div class="scale-row">
        <div class="scale-card">
          <span class="scale-title">Gmail (1-${getQuestionScaleMax(question)})</span>
          <div class="dot-scale">
            ${makeDotScale(`${question.id}_gmail`, getQuestionScaleMax(question))}
          </div>
        </div>
        <div class="scale-card">
          <span class="scale-title">Outlook (1-${getQuestionScaleMax(question)})</span>
          <div class="dot-scale">
            ${makeDotScale(`${question.id}_outlook`, getQuestionScaleMax(question))}
          </div>
        </div>
      </div>
    </article>
  `).join('');
}

function setModeBanner() {
  const modeBanner = document.getElementById('modeBanner');
  if (hasSupabaseConfig) {
    modeBanner.textContent = 'Tryb zapisu: Supabase (online).';
    return;
  }
  modeBanner.textContent = 'Tryb zapisu online niedostępny. Uzupełnij config.js.';
}

function collectAnswers(formData) {
  const answers = [];

  for (const question of QUESTIONS) {
    const gmailRaw = formData.get(`${question.id}_gmail`);
    const outlookRaw = formData.get(`${question.id}_outlook`);
    const gmail = gmailRaw === null ? NaN : Number(gmailRaw);
    const outlook = outlookRaw === null ? NaN : Number(outlookRaw);
    const scaleMax = getQuestionScaleMax(question);
    const valid = Number.isFinite(gmail)
      && Number.isFinite(outlook)
      && gmail >= 1
      && gmail <= scaleMax
      && outlook >= 1
      && outlook <= scaleMax;

    if (!valid) {
      continue;
    }

    answers.push({
      id: question.id,
      title: question.title,
      gmail,
      outlook,
      scale_max: scaleMax
    });
  }

  return answers;
}

function validateAnswers(answers) {
  return answers.length > 0;
}

async function saveResponse(record) {
  if (!hasSupabaseConfig) {
    throw new Error('Brak konfiguracji Supabase. Uzupełnij config.js.');
  }

  const payload = {
    participant_name: record.participant_name,
    experience_level: 'brak',
    overall_preference: record.overall_preference
  };
  for (const a of record.answers) {
    payload[`${a.id}_gmail`] = a.gmail;
    payload[`${a.id}_outlook`] = a.outlook;
  }

  const { error } = await supabaseClient.from('survey_responses').insert(payload);
  if (error) {
    throw new Error(error.message || 'Nie udało się zapisać odpowiedzi.');
  }
}

// --- Tabs ---
function initTabs() {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
      const target = document.getElementById(`tab-${tab.dataset.tab}`);
      if (target) {
        target.classList.add('active');
      }

      if (tab.dataset.tab === 'analysis' && !analysisLoaded) {
        loadAnalysis();
      }
    });
  });
}

// --- Analysis ---
let analysisLoaded = false;

async function loadAnalysis() {
  const statusEl = document.getElementById('analysisStatus');
  const statsContainer = document.getElementById('statsContainer');

  if (!hasSupabaseConfig || !supabaseClient) {
    statusEl.textContent = 'Brak konfiguracji Supabase. Uzupełnij config.js, aby wyświetlić analizę.';
    return;
  }

  try {
    const { data, error } = await supabaseClient
      .from('survey_responses')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) {
      statusEl.textContent = 'Brak danych w bazie.';
      return;
    }

    statusEl.textContent = `Pobrano ${data.length} odpowiedzi. Generowanie wykresów...`;
    renderStats(statsContainer, data);
    renderComparisonChart(data);
    renderPerQuestionCharts(data);
    renderPreferenceCharts(data);
    statusEl.textContent = '';
    analysisLoaded = true;
  } catch (err) {
    statusEl.textContent = `Błąd ładowania danych: ${err.message}`;
  }
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

function computeMeans(data) {
  const results = [];
  for (const q of QUESTIONS) {
    const gmailVals = data.map(d => d[`${q.id}_gmail`]).filter(v => v != null && !isNaN(v));
    const outlookVals = data.map(d => d[`${q.id}_outlook`]).filter(v => v != null && !isNaN(v));
    results.push({
      id: q.id,
      title: q.title,
      gmailMean: gmailVals.length ? gmailVals.reduce((a, b) => a + b, 0) / gmailVals.length : 0,
      outlookMean: outlookVals.length ? outlookVals.reduce((a, b) => a + b, 0) / outlookVals.length : 0,
      gmailCount: gmailVals.length,
      outlookCount: outlookVals.length
    });
  }
  return results;
}

const CHART_COLORS = {
  gmail: '#ff6a3d',
  outlook: '#0d8f8d',
  tie: '#999999'
};

function renderComparisonChart(data) {
  const means = computeMeans(data);
  const ctx = document.getElementById('chartComparison').getContext('2d');

  new Chart(ctx, {
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
  });
}

function renderPerQuestionCharts(data) {
  const means = computeMeans(data);

  for (let i = 0; i < QUESTIONS.length; i++) {
    const m = means[i];
    const canvas = document.getElementById(`chartQ${i + 1}`);
    if (!canvas) continue;
    const ctx = canvas.getContext('2d');

    new Chart(ctx, {
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
    });
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

  // Bar chart
  const ctxBar = document.getElementById('chartPrefBar').getContext('2d');
  new Chart(ctxBar, {
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
  });

  // Pie chart
  const ctxPie = document.getElementById('chartPrefPie').getContext('2d');
  new Chart(ctxPie, {
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
  });
}

// --- Init ---
const form = document.getElementById('surveyForm');
const submitStatus = document.getElementById('submitStatus');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  submitStatus.textContent = 'Zapisuję odpowiedzi...';

  const formData = new FormData(form);
  const answers = collectAnswers(formData);

  if (!validateAnswers(answers)) {
    submitStatus.textContent = 'Uzupelnij przynajmniej jedno pytanie (Gmail i Outlook).';
    return;
  }

  const record = {
    participant_name: String(formData.get('participantName') || '').trim(),
    answers,
    overall_preference: String(formData.get('overallPreference') || ''),
    created_at: new Date().toISOString()
  };

  try {
    await saveResponse(record);
    form.reset();
    submitStatus.textContent = 'Odpowiedzi zostały zapisane.';
  } catch (error) {
    submitStatus.textContent = `Błąd zapisu: ${error.message}`;
  }
});

renderQuestions();
setModeBanner();
initTabs();
