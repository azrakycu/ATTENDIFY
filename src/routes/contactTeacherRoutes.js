const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
require('dotenv').config();  // .env dosyasını yükle

// İletişim formu ile gelen mesajı e-posta olarak gönder
router.post('/send-teacher', async (req, res) => {
  const { fullname, email, subject, message, teachermails } = req.body;

  // Nodemailer ile e-posta gönderimi ayarları
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME, // .env dosyasındaki e-posta adresi
      pass: process.env.EMAIL_PASSWORD, // .env dosyasındaki şifre
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: teachermails, // Formdan gelen e-posta adresi
    subject: subject, // Formdaki konu kısmı
    text: `Ad ve Soyad: ${fullname}\nE-posta: ${email}\n\nMesaj: ${message}`, // Mesaj içeriği
  };

  try {
    // E-postayı gönder
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Mesaj başarıyla gönderildi!' });
  } catch (error) {
    console.error('E-posta gönderme hatası:', error);
    res.status(500).json({ message: 'Mesaj gönderilemedi.' });
  }
});

module.exports = router;
