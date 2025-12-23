// frontend/js/chatbot.js
(() => {
  const chatWindow = document.getElementById('chatWindow');
  const form = document.getElementById('chatForm');
  const input = document.getElementById('chatInput');

  function appendMessage(from, text) {
    const el = document.createElement('div');
    el.className = from === 'user' ? 'bubble user' : 'bubble ai';
    el.textContent = text;
    chatWindow.appendChild(el);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const txt = input.value.trim();
    if (!txt) return;
    appendMessage('user', txt);
    input.value = '';

    // Try backend
    try {
      const res = await fetch('http://localhost:5000/api/chat', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ message: txt })
      });
      if (!res.ok) throw new Error('no');
      const data = await res.json();
      appendMessage('ai', data.reply || data);
    } catch (err) {
      // Mock reply
      setTimeout(() => {
        appendMessage('ai', `Mock reply to: "${txt}" — (replace with your backend AI).`);
      }, 500);
    }
  });
})();
