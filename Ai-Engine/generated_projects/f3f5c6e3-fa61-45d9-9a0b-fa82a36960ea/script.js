document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    fetch('/send-email', {
      method: 'POST',
      body: formData
    }).then(response => response.json())
      .then(data => {
        if (data.success) {
          alert('Message sent successfully!');
          form.reset();
        } else {
          alert('Error sending message.');
        }
      });
  });
});