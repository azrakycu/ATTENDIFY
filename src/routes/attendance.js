const express = require('express');
const Attendance = require('./src/models/Attendance');
const User = require('../models/Class');
const router = express.Router();

// Dönem ve hafta numarasına göre yoklama bilgisi almak
router.get('/:semester/:week', async (req, res) => {
  const { semester, week } = req.params;

  try {
    const attendance = await Attendance.findOne({ semester })
      .select(`weeks.${week - 1}`); // week parametresi 1'den başladığı için, index 0'dan başlar

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance data not found for this week' });
    }

    const weekData = attendance.weeks[week - 1];
    res.status(200).json(weekData);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Öğrenci katılım durumunu güncelleme
router.post('/:semester/:week/update', async (req, res) => {
  const { semester, week } = req.params;
  const { studentId, status } = req.body; // 'present', 'absent', 'late'

  try {
    const attendance = await Attendance.findOne({ semester });

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance data not found' });
    }

    const weekData = attendance.weeks[week - 1];
    const studentIndex = weekData.attendance.findIndex((att) => att.studentId.toString() === studentId);

    if (studentIndex !== -1) {
      // Öğrenci varsa, katılım durumunu güncelle
      weekData.attendance[studentIndex].status = status;
    } else {
      // Öğrenci yoksa, yeni katılım ekle
      weekData.attendance.push({ studentId, status });
    }

    await attendance.save();
    res.status(200).json({ message: 'Attendance updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error updating attendance' });
  }
});

module.exports = router;
