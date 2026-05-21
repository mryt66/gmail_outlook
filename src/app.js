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
