const express = require('express');
const { generatePasskey } = require('../utils/passkeyGenerator.js');

const router = express.Router();

// Şifre oluştur ve öğretmene ver
router.post('/create', (req, res) => {
  const { weekStartDate } = req.body;

  if (!weekStartDate) {
    return res.status(400).json({ error: 'Haftanın başlangıç tarihi gerekli.' });
  }

  try {
    const passkey = generatePasskey(new Date(weekStartDate)); // Tarihe göre şifre üret
    res.status(200).json({ passkey }); // Şifreyi öğretmene gönder
  } catch (error) {
    console.error('Şifre oluşturma hatası:', error.message);
    res.status(500).json({ error: 'Şifre oluşturulamadı.' });
  }
});

module.exports = router;
