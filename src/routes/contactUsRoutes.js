const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
require('dotenv').config();  // .env dosyasını yükle

// Contact formu ile gelen mesajı e-posta olarak gönder
router.post('/send-contact-us', async (req, res) => {
  const { name, email, message } = req.body;

  // Nodemailer ile e-posta gönderimi ayarları
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME, // .env dosyasındaki e-posta adresi
      pass: process.env.EMAIL_PASSWORD, // .env dosyasındaki şifre
    },
  });

  const mailOptions = {
    from: email, // Formdan gelen e-posta adresi
    to: process.env.EMAIL_USERNAME, // Mesajın gönderileceği e-posta adresi
    subject: 'Contact Us Message from ' + name,
    text: `Message from: ${name}\nEmail: ${email}\n\nMessage: ${message}`,
  };

  try {
    // E-postayı gönder
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send message.' });
  }
});

module.exports = router;
