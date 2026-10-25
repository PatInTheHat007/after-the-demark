const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('nav');
navToggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open);
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => nav.classList.remove('open')));

const form = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');
const submitBtn = form.querySelector('button[type="submit"]');
const formspreeReady = !form.action.includes('YOUR_FORM_ID');

function showMessage(text, color) {
  formMessage.textContent = text;
  formMessage.style.color = color;
}

// Used until a Formspree form ID is set, and as a backup if the request fails.
function openMailFallback(name, email, phone, town, message) {
  const subject = encodeURIComponent(`Diagnostic Request from ${name}`);
  const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nTown: ${town}\n\n${message}`);
  window.location.href = `mailto:PMurfy21@yahoo.com?subject=${subject}&body=${body}`;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const phone = form.phone.value.trim();
  const town = form.town.value.trim();
  const message = form.message.value.trim();
  if (!name || !email || !message) {
    showMessage('Please fill in your name, email, and how we can help.', '#f87171');
    return;
  }

  if (!formspreeReady) {
    openMailFallback(name, email, phone, town, message);
    showMessage('Opening your email app… If nothing happens, call or text (607) 857-3355.', '#00b4d8');
    return;
  }

  submitBtn.disabled = true;
  showMessage('Sending…', '#cbd5e1');
  try {
    const res = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    form.reset();
    showMessage('Thanks! Your request was sent. I’ll get back to you soon.', '#22c55e');
  } catch {
    showMessage('Something went wrong sending the form. Please call or text (607) 857-3355.', '#f87171');
  } finally {
    submitBtn.disabled = false;
  }
});
