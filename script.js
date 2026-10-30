const form = document.getElementById('contactForm');
const formMsg = document.getElementById('formMsg');
const submitBtn = form.querySelector('button[type="submit"]');
const formspreeReady = !form.action.includes('YOUR_FORM_ID');

function showMessage(text, color) {
  formMsg.textContent = text;
  formMsg.style.color = color;
}

// Used until a Formspree form ID is set, and as a backup if the request fails.
function openMailFallback(f) {
  const subject = encodeURIComponent(`Assessment request from ${f.name}`);
  const body = encodeURIComponent(`Name: ${f.name}\nEmail: ${f.email}\nPhone: ${f.phone}\nTown: ${f.town}\n\n${f.message}`);
  window.location.href = `mailto:PMurfy21@yahoo.com?subject=${subject}&body=${body}`;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = Object.fromEntries(['name', 'email', 'phone', 'town', 'message'].map(k => [k, form[k].value.trim()]));
  if (!f.name || !f.email || !f.message) {
    showMessage('Please fill in your name, email, and what\'s going on.', '#D64545');
    return;
  }

  if (!formspreeReady) {
    openMailFallback(f);
    showMessage('Opening your email app… If nothing happens, call or text (607) 857-3355.', '#12A594');
    return;
  }

  submitBtn.disabled = true;
  showMessage('Sending…', '#5D6E78');
  try {
    const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    form.reset();
    showMessage('Thanks! Your request was sent. I\'ll get back to you within one business day.', '#2E9D5B');
  } catch {
    showMessage('Something went wrong sending the form. Please call or text (607) 857-3355.', '#D64545');
  } finally {
    submitBtn.disabled = false;
  }
});
