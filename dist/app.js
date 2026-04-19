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

const SCALE_VALUES = [1, 2, 3, 4, 5, 6, 7];
const LOCAL_STORAGE_KEY = 'gmail-outlook-survey-responses';

const modeBanner = document.getElementById('modeBanner');
const form = document.getElementById('surveyForm');
const questionContainer = document.getElementById('questionContainer');
const submitStatus = document.getElementById('submitStatus');
const chartStatus = document.getElementById('chartStatus');
const refreshButton = document.getElementById('refreshButton');

const CHART_IDS = ['barChart1', 'barChart2', 'barChart3', 'barChart4'];
const CHART_GROUPS = [
  [0, 1],
  [2, 3],
  [4, 5],
  [6, 7]
];

let groupedBarCharts = [];

const appConfig = window.APP_CONFIG || null;
const hasSupabaseConfig = Boolean(appConfig?.supabaseUrl && appConfig?.supabaseAnonKey);
const supabaseClient = hasSupabaseConfig
  ? window.supabase.createClient(appConfig.supabaseUrl, appConfig.supabaseAnonKey)
  : null;

function makeScaleOptions() {
  return ['<option value="" selected disabled>Wybierz 1-7</option>']
    .concat(SCALE_VALUES.map((value) => `<option value="${value}">${value}</option>`))
    .join('');
}

function renderQuestions() {
  questionContainer.innerHTML = QUESTIONS.map((question, index) => `
    <article class="question" style="animation-delay: ${index * 70}ms">
      <h3>${index + 1}. ${question.title}</h3>
      <details class="instructions">
        <summary>Instrukcja do pytania</summary>
        <p>${question.instruction}</p>
      </details>
      <div class="scale-row">
        <label>
          Gmail (1-7)
          <select name="${question.id}_gmail" required>
            ${makeScaleOptions()}
          </select>
        </label>
        <label>
          Outlook (1-7)
          <select name="${question.id}_outlook" required>
            ${makeScaleOptions()}
          </select>
        </label>
      </div>
      <label>
        Notatka (opcjonalnie)
        <textarea name="${question.id}_note" rows="2" maxlength="500" placeholder="Krótka obserwacja do tego kryterium..."></textarea>
      </label>
    </article>
  `).join('');
}

function setModeBanner() {
  if (hasSupabaseConfig) {
    modeBanner.textContent = 'Tryb zapisu: Supabase (online).';
    return;
  }
  modeBanner.textContent = 'Tryb zapisu: lokalny (brak config.js). Wypełnij config.js, aby zapisywać online.';
}

function collectAnswers(formData) {
  return QUESTIONS.map((question) => ({
    id: question.id,
    title: question.title,
    gmail: Number(formData.get(`${question.id}_gmail`)),
    outlook: Number(formData.get(`${question.id}_outlook`)),
    note: String(formData.get(`${question.id}_note`) || '').trim()
  }));
}

function validateAnswers(answers) {
  return answers.every((answer) => SCALE_VALUES.includes(answer.gmail) && SCALE_VALUES.includes(answer.outlook));
}

function loadLocalResponses() {
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalResponse(record) {
  const existing = loadLocalResponses();
  existing.push(record);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existing));
}

async function saveResponse(record) {
  if (!hasSupabaseConfig) {
    saveLocalResponse(record);
    return;
  }

  const payload = {
    participant_name: record.participant_name,
    experience_level: record.experience_level,
    answers: record.answers,
    overall_preference: record.overall_preference,
    overall_comment: record.overall_comment
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
  for (const chart of groupedBarCharts) {
    chart.destroy();
  }
  groupedBarCharts = [];

  CHART_GROUPS.forEach((group, index) => {
    const chartId = CHART_IDS[index];
    const canvas = document.getElementById(chartId);
    if (!canvas) {
      return;
    }

    const labels = group.map((questionIndex) => aggregate.labels[questionIndex]);
    const gmailData = group.map((questionIndex) => aggregate.gmailAverages[questionIndex]);
    const outlookData = group.map((questionIndex) => aggregate.outlookAverages[questionIndex]);

    const chart = new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Gmail',
            data: gmailData,
            backgroundColor: '#ff6a3d'
          },
          {
            label: 'Outlook',
            data: outlookData,
            backgroundColor: '#0d8f8d'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            min: 0,
            max: 10,
            ticks: { stepSize: 1 }
          }
        }
      }
    });

    groupedBarCharts.push(chart);
  });
}

async function fetchRows() {
  if (!hasSupabaseConfig) {
    return loadLocalResponses();
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
    submitStatus.textContent = 'Uzupełnij wszystkie oceny 1-7.';
    return;
  }

  const record = {
    participant_name: String(formData.get('participantName') || '').trim(),
    experience_level: String(formData.get('experienceLevel') || ''),
    answers,
    overall_preference: String(formData.get('overallPreference') || ''),
    overall_comment: String(formData.get('overallComment') || '').trim(),
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
