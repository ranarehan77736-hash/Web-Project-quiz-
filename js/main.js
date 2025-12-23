// frontend/js/main.js
(() => {
  const path = location.pathname.split('/').pop();

  // Simple navigation logic for index.html
  if (path === '' || path === 'index.html') {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    document.getElementById('showSignup').addEventListener('click', e => {
      e.preventDefault(); loginForm.classList.add('hidden'); signupForm.classList.remove('hidden');
    });
    document.getElementById('showLogin').addEventListener('click', e => {
      e.preventDefault(); signupForm.classList.add('hidden'); loginForm.classList.remove('hidden');
    });

    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      // stub: accept any credentials, save "user"
      const email = document.getElementById('loginEmail').value;
      localStorage.setItem('user', JSON.stringify({ email }));
      location.href = 'dashboard.html';
    });

    signupForm.addEventListener('submit', e => {
      e.preventDefault();
      const name = document.getElementById('signupName').value;
      const email = document.getElementById('signupEmail').value;
      localStorage.setItem('user', JSON.stringify({ name, email }));
      location.href = 'dashboard.html';
    });
  }

  // Dashboard page behavior
  if (path === 'dashboard.html') {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.email) {
      alert('Please login first');
      location.href = 'index.html';
      return;
    }

    document.getElementById('logoutBtn').addEventListener('click', () => {
      localStorage.removeItem('user');
      location.href = 'index.html';
    });

    // Start quiz button
    document.getElementById('startQuizBtn').addEventListener('click', () => {
      const topic = document.getElementById('topicInput').value || 'general';
      const count = parseInt(document.getElementById('countInput').value, 10) || 5;
      // Pass params via querystring to quiz.html
      location.href = `quiz.html?topic=${encodeURIComponent(topic)}&count=${count}`;
    });

    // Render history
    function renderHistory() {
      const h = JSON.parse(localStorage.getItem('quizAttempts') || '[]');
      const out = document.getElementById('history');
      if (!h.length) { out.textContent = 'No attempts yet.'; return; }
      out.innerHTML = h.slice().reverse().map(a => {
        return `<div class="attempt">
          <strong>${a.topic}</strong> — ${a.score}/${a.total} — ${new Date(a.date).toLocaleString()}
        </div>`;
      }).join('');
    }
    renderHistory();
  }
})();
