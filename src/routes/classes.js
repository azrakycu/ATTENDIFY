const express = require('express');
const router = express.Router();
const Class = require('../models/Class');

// Öğretmenin derslerini ve öğrencileri getir
router.get('/teacher/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;

    // Belirli öğretmenin derslerini bul
    const classes = await Class.find({ teacherId });

    if (!classes.length) {
      return res.status(404).json({ message: 'Bu öğretmene ait ders bulunamadı.' });
    }

    res.status(200).json({
      message: 'Dersler başarıyla alındı.',
      classes: classes,
    });
  } catch (error) {
    res.status(500).json({ message: 'Dersler alınırken bir hata oluştu.', error: error.message });
  }
});

module.exports = router;
