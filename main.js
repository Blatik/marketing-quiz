const questions = [
  {
    id: 1,
    title: "БАР'ЄР",
    question: "Що зараз є головним бар'єром для кратного зростання вашого прибутку?",
    options: [
      "Маркетинг — це 'лотерея': сьогодні ліди є, завтра немає.",
      "Відділ продажів каже, що ліди 'холодні' або 'сміттєві'.",
      "Висока вартість залучення клієнта (CAC) з’їдає маржу.",
      "Я сам 'людина-оркестр' і не маю часу на контроль."
    ]
  },
  {
    id: 2,
    title: "ЗЛИВ",
    question: "Де, на вашу думку, ви зливає за найбільше рекламного бюджету?",
    options: [
      "Сайт має низьку конверсію — люди заходять і йдуть.",
      "Реклама налаштована, але я не бачу реальної аналітики та ROI.",
      "Пробував різних підрядників, але результат завжди слабкий.",
      "Конкуренти перебивають ціну, а я не знаю, як виділитися."
    ]
  },
  {
    id: 3,
    title: "ПРОГНОЗ",
    question: "Наскільки ваші продажі сьогодні є прогнозованими?",
    options: [
      "Понад 50% — це 'сарафанка'. Якщо вона зупиниться — бізнес згасне.",
      "Маю інструменти (сайт/соцмережі), але вони не працюють як воронка.",
      "Система ламається при спробі масштабування (ціна ліда росте).",
      "Поки що все працює хаотично, без чіткого плану."
    ]
  },
  {
    id: 4,
    title: "ПОТЕНЦІАЛ",
    question: "На який обсяг додаткового чистого прибутку ви хочете вийти?",
    options: [
      "До 20,000 ₴ — для тих, хто тільки починає або тестує нішу.",
      "20,000 – 50,000 ₴ — для сталого малого бізнесу, що шукає стабільності.",
      "50,000 – 100,000 ₴ — для тих, хто вже має обіг і готовий розширюватися.",
      "Понад 100,000 ₴ — амбітні цілі для малого бізнесу, де вже потрібна чітка система."
    ]
  },
  {
    id: 5,
    title: "КОНТАКТ",
    question: "Який формат обговорення стратегії для вас найзручніший?",
    options: [
      "Листування у Telegram (без дзвінків).",
      "Отримати розбір текстом і далі вирішити.",
      "Аудит моєї поточної ситуації у форматі повідомлень.",
      "Мені потрібна лише ціна та терміни."
    ]
  }
];

let currentStep = 0;
const userAnswers = [];

// DOM Elements
const welcomeScreen = document.getElementById('welcome-screen');
const quizScreen = document.getElementById('quiz-screen');
const analysisScreen = document.getElementById('analysis-screen');
const thankYouScreen = document.getElementById('thank-you-screen');
const quizContent = document.getElementById('quiz-content');
const progressFill = document.getElementById('progress-fill');
const startBtn = document.getElementById('start-quiz');

// State Manager
function showScreen(screenId) {
  const screens = [welcomeScreen, quizScreen, analysisScreen, thankYouScreen];
  screens.forEach(s => {
    if (s) s.classList.remove('active');
  });
  const active = document.getElementById(screenId);
  if (active) active.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Navigation
if (startBtn) {
  startBtn.addEventListener('click', () => {
    showScreen('quiz-screen');
    renderQuestion();
  });
}

function renderQuestion() {
  const q = questions[currentStep];
  const progress = ((currentStep) / questions.length) * 100;
  progressFill.style.width = `${progress}%`;

  quizContent.innerHTML = `
    <div class="step-indicator slide-up">${currentStep + 1} / ${questions.length}</div>
    <h2 class="slide-up">${q.question}</h2>
    <div class="options-grid">
      ${q.options.map((opt, idx) => `
        <div class="option-card slide-up" style="animation-delay: ${idx * 0.1}s" data-idx="${idx}">
          <p>${opt}</p>
        </div>
      `).join('')}
    </div>
  `;

  document.querySelectorAll('.option-card').forEach(card => {
    card.addEventListener('click', () => {
      // Add visual feedback before transition
      card.style.background = 'rgba(255,255,255,0.2)';
      userAnswers.push({
        title: q.title,
        question: q.question,
        answer: q.options[card.dataset.idx]
      });

      setTimeout(() => {
        nextStep();
      }, 300);
    });
  });
}

function nextStep() {
  currentStep++;
  if (currentStep < questions.length) {
    renderQuestion();
  } else {
    startAnalysis();
  }
}

async function startAnalysis() {
  showScreen('analysis-screen');

  const steps = [
    document.getElementById('step-1'),
    document.getElementById('step-2'),
    document.getElementById('step-3')
  ];

  for (let i = 0; i < steps.length; i++) {
    await new Promise(r => setTimeout(r, 800));
    steps[i].classList.add('visible');
  }

  await new Promise(r => setTimeout(r, 500));
  finishQuiz();
}

function finishQuiz() {
  progressFill.style.width = '100%';

  // Track lead event via FB Pixel
  if (typeof fbq === 'function') {
    fbq('track', 'Lead');
  }

  showScreen('thank-you-screen');
  initLeadForm();
}

function initLeadForm() {
  const form = document.getElementById('lead-form');
  const successDiv = document.getElementById('form-success');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('submit-lead');
    submitBtn.disabled = true;
    submitBtn.innerText = 'Надсилаємо...';

    const name = document.getElementById('lead-name').value;
    const contact = document.getElementById('lead-contact').value;

    let report = `🚀 *НОВИЙ ЛІД З КВІЗУ*\n\n`;
    report += `👤 *Ім'я:* ${name}\n`;
    report += `📧 *Email:* ${contact}\n\n`;
    report += `🏁 *РЕЗУЛЬТАТИ АУДИТУ*\n`;
    userAnswers.forEach((a, i) => {
      report += `🔹 *${a.title}:* ${a.answer}\n`;
    });

    try {
      await sendTelegram(report);
      form.classList.add('hidden');
      successDiv.classList.remove('hidden');
    } catch (error) {
      console.error('Error:', error);
      alert('Помилка при надсиланні. Будь ласка, спробуйте ще раз або напишіть у Telegram.');
      submitBtn.disabled = false;
      submitBtn.innerText = 'Надіслати та отримати план';
    }
  });
}

async function sendTelegram(text) {
  const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    console.error('Telegram credentials not found in environment variables.');
    return;
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: text,
      parse_mode: 'Markdown'
    })
  });

  if (!response.ok) throw new Error('Telegram API error');
}
