// frontend/js/quiz.js
(() => {
  const qs = new URLSearchParams(location.search);
  const topic = qs.get('topic') || 'general';
  const count = parseInt(qs.get('count') || '5', 10);

  document.getElementById('topicLabel').textContent = topic;

  // State
  let questions = [];
  let answers = []; // store selected option indexes or null
  let current = 0;
  let timerSeconds = count * 30; // 30s per question default
  let timerInterval;

  async function fetchQuiz() {
    // Try backend, fallback to mock
    try {
      const res = await fetch(`http://localhost:5000/api/quiz/generate`, {
        method: 'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ topic, count })
      });
      if (!res.ok) throw new Error('Network');
      const data = await res.json();
      return data.questions || data;
    } catch (err) {
      console.warn('Backend unavailable — using mock quiz', err);
      // Mock: simple generated questions
      const mock = [];
      for (let i=0;i<count;i++){
        mock.push({
          id: `m${i}`,
          q: `Mock question ${i+1} about ${topic}?`,
          options: ['Option A','Option B','Option C','Option D'],
          answer: 0
        });
      }
      return mock;
    }
  }

  function startTimer() {
    updateTimerDisplay();
    timerInterval = setInterval(() => {
      timerSeconds--;
      if (timerSeconds <= 0) {
        clearInterval(timerInterval);
        submitQuiz();
      } else {
        updateTimerDisplay();
      }
    }, 1000);
  }
  function updateTimerDisplay() {
    const mm = String(Math.floor(timerSeconds / 60)).padStart(2,'0');
    const ss = String(timerSeconds % 60).padStart(2,'0');
    document.getElementById('timer').textContent = `${mm}:${ss}`;
  }

  function renderQuestion() {
    const area = document.getElementById('questionArea');
    const q = questions[current];
    const selected = answers[current];
    area.innerHTML = `
      <h3>Question ${current+1} of ${questions.length}</h3>
      <p class="q-text">${q.q}</p>
      <div class="options">
        ${q.options.map((opt,i) => `
          <label class="option ${selected===i ? 'selected' : ''}">
            <input type="radio" name="opt" value="${i}" ${selected===i ? 'checked' : ''}/>
            <span>${opt}</span>
          </label>
        `).join('')}
      </div>
    `;

    // attach listeners
    area.querySelectorAll('input[name="opt"]').forEach(r => {
      r.addEventListener('change', (e) => {
        answers[current] = parseInt(e.target.value, 10);
      });
    });
  }

  document.getElementById('prevBtn').addEventListener('click', () => {
    if (current > 0) current--;
    renderQuestion();
  });
  document.getElementById('nextBtn').addEventListener('click', () => {
    if (current < questions.length - 1) current++;
    renderQuestion();
  });

  async function init() {
    questions = await fetchQuiz();
    answers = Array(questions.length).fill(null);
    renderQuestion();
    startTimer();
  }

  function submitQuiz() {
    clearInterval(timerInterval);
    // calculate score (compare to question.answer if available)
    let score = 0;
    for (let i=0;i<questions.length;i++){
      const q = questions[i];
      if (typeof q.answer !== 'undefined' && answers[i] === q.answer) score++;
    }
    const attempt = {
      id: 'a_'+Date.now(),
      topic,
      date: new Date().toISOString(),
      score,
      total: questions.length,
      answers,
    };
    const all = JSON.parse(localStorage.getItem('quizAttempts') || '[]');
    all.push(attempt);
    localStorage.setItem('quizAttempts', JSON.stringify(all));

    // Show result
    const resEl = document.getElementById('result');
    resEl.classList.remove('hidden');
    resEl.innerHTML = `<h3>Result</h3><p>${score} / ${questions.length}</p><a href="dashboard.html">Back to dashboard</a>`;
    document.getElementById('quizCard').querySelectorAll('button').forEach(b => b.disabled = true);
  }

  document.getElementById('submitBtn').addEventListener('click', () => {
    if (!confirm('Submit quiz now?')) return;
    submitQuiz();
  });

  // init
  init();
})();
