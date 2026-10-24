const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('nav');
navToggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open);
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => nav.classList.remove('open')));

const form = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const message = form.message.value.trim();
  if (!name || !email || !message) {
    formMessage.textContent = 'Please fill in all required fields.';
    formMessage.style.color = '#f87171';
    return;
  }
  const subject = encodeURIComponent(`Diagnostic Request from ${name}`);
  const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nPhone: ${form.phone.value}\n\n${message}`);
  window.location.href = `mailto:PMurfy21@yahoo.com?subject=${subject}&body=${body}`;
  formMessage.textContent = 'Opening your email client…';
  formMessage.style.color = '#00b4d8';
  form.reset();
});