document.getElementById('contactForm').addEventListener('submit', function(event) {
  event.preventDefault(); // Formun normal gönderilmesini engelle

  // Form verilerini al
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const message = document.getElementById('message').value;

  // Verileri API'ye gönder
  fetch('https://peaceful-forest-90255-fbe04ed90482.herokuapp.com/api/contactUsRoutes/send-contact-us', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: name,
      email: email,
      message: message,
    }),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to send message.'); // Eğer istek başarısızsa hata fırlat
      }
      return response.json();
    })
    .then(data => {
      console.log(data); // Gelen yanıtı konsola yazdır
      alert('Thank you for your message! We will get back to you soon.'); // Başarı mesajı
    })
    .catch(error => {
      console.error('Error:', error); // Hata durumunda konsola yazdır
      alert('Something went wrong. Please try again later.'); // Hata mesajı
    })
    .finally(() => {
      document.getElementById('contactForm').reset(); // Formu her durumda sıfırla
    });
});

  
  
    
  
  
    