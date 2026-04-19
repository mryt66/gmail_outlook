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

const modeBanner = document.getElementById('modeBanner');
const form = document.getElementById('surveyForm');
const questionContainer = document.getElementById('questionContainer');
const submitStatus = document.getElementById('submitStatus');
const chartStatus = document.getElementById('chartStatus');
const refreshButton = document.getElementById('refreshButton');

const SCALE_DEFAULT_MAX = 10;
const CHART_CANVAS_IDS = [
  'barChartQ1',
  'barChartQ2',
  'barChartQ3',
  'barChartQ4',
  'barChartQ5',
  'barChartQ6',
  'barChartQ7',
  'barChartQ8'
];

let chartInstances = [];

const appConfig = window.APP_CONFIG || null;
const hasSupabaseConfig = Boolean(
  appConfig?.supabaseUrl
  && appConfig?.supabaseAnonKey
  && !appConfig.supabaseUrl.includes('twoj-projekt')
  && !appConfig.supabaseAnonKey.includes('twoj_anon_key')
);
const supabaseClient = hasSupabaseConfig
  ? window.supabase.createClient(appConfig.supabaseUrl, appConfig.supabaseAnonKey)
  : null;

function getQuestionScaleMax(question) {
  return Number(question.scaleMax || SCALE_DEFAULT_MAX);
}

function makeDotScale(name, maxValue, checkedValue) {
  const dots = [];
  for (let value = 1; value <= maxValue; value += 1) {
    dots.push(`
      <label class="dot-option" title="${value}">
        <input type="radio" name="${name}" value="${value}"${checkedValue === value ? ' checked' : ''} />
        <span class="dot"></span>
        <span class="dot-number">${value}</span>
      </label>
    `);
  }
  return dots.join('');
}

function renderQuestions() {
  // Losowe wartości dla każdego pytania i platformy
  const randoms = QUESTIONS.map((q) => ({
    gmail: Math.floor(Math.random() * getQuestionScaleMax(q)) + 1,
    outlook: Math.floor(Math.random() * getQuestionScaleMax(q)) + 1
  }));

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
            ${makeDotScale(`${question.id}_gmail`, getQuestionScaleMax(question), randoms[index].gmail)}
          </div>
        </div>
        <div class="scale-card">
          <span class="scale-title">Outlook (1-${getQuestionScaleMax(question)})</span>
          <div class="dot-scale">
            ${makeDotScale(`${question.id}_outlook`, getQuestionScaleMax(question), randoms[index].outlook)}
          </div>
        </div>
      </div>
    </article>
  `).join('');
}

function setModeBanner() {
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
    answers: record.answers,
    overall_preference: record.overall_preference
  };

  const { error } = await supabaseClient.from('survey_responses').insert(payload);
  if (error) {
    throw new Error(error.message || 'Nie udało się zapisać odpowiedzi.');
  }
}

function aggregateData(rows) {
  const totals = QUESTIONS.reduce((acc, question) => {
    acc[question.id] = { gmailSum: 0, outlookSum: 0, count: 0 };
    return acc;
  }, {});

  const preference = { gmail: 0, outlook: 0, remis: 0 };

  for (const row of rows) {
    const answers = Array.isArray(row.answers) ? row.answers : [];

    for (const answer of answers) {
      if (!totals[answer.id]) {
        continue;
      }
      const gmail = Number(answer.gmail);
      const outlook = Number(answer.outlook);
      if (!Number.isFinite(gmail) || !Number.isFinite(outlook)) {
        continue;
      }
      totals[answer.id].gmailSum += gmail;
      totals[answer.id].outlookSum += outlook;
      totals[answer.id].count += 1;
    }

    if (row.overall_preference === 'gmail') {
      preference.gmail += 1;
    }
    if (row.overall_preference === 'outlook') {
      preference.outlook += 1;
    }
    if (row.overall_preference === 'remis') {
      preference.remis += 1;
    }
  }

  const labels = QUESTIONS.map((item) => item.title);
  const gmailAverages = QUESTIONS.map((item) => {
    const t = totals[item.id];
    return t.count ? Number((t.gmailSum / t.count).toFixed(2)) : 0;
  });
  const outlookAverages = QUESTIONS.map((item) => {
    const t = totals[item.id];
    return t.count ? Number((t.outlookSum / t.count).toFixed(2)) : 0;
  });

  return { labels, gmailAverages, outlookAverages, preference };
}

function renderCharts(aggregate) {
  for (const chart of chartInstances) {
    chart.destroy();
  }
  chartInstances = [];

  CHART_CANVAS_IDS.forEach((canvasId, index) => {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      return;
    }

    const chart = new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels: ['Gmail', 'Outlook'],
        datasets: [
          {
            label: `Q${index + 1}`,
            data: [aggregate.gmailAverages[index], aggregate.outlookAverages[index]],
            backgroundColor: ['#ff6a3d', '#0d8f8d']
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            min: 0,
            max: 10,
            ticks: { stepSize: 1 }
          }
        }
      }
    });

    chartInstances.push(chart);
  });
}

async function fetchRows() {
  if (!hasSupabaseConfig) {
    return [];
  }

  const { data, error } = await supabaseClient
    .from('survey_responses')
    .select('answers, overall_preference')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message || 'Nie udało się pobrać danych.');
  }

  return data || [];
}

async function refreshCharts() {
  chartStatus.textContent = 'Pobieram dane do wykresów...';
  try {
    const rows = await fetchRows();
    const aggregate = aggregateData(rows);
    renderCharts(aggregate);
    chartStatus.textContent = `Wykresy zaktualizowane. Odpowiedzi: ${rows.length}.`;
  } catch (error) {
    chartStatus.textContent = `Błąd wykresów: ${error.message}`;
  }
}

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
    await refreshCharts();
  } catch (error) {
    submitStatus.textContent = `Błąd zapisu: ${error.message}`;
  }
});

refreshButton.addEventListener('click', refreshCharts);

renderQuestions();
setModeBanner();
refreshCharts();
