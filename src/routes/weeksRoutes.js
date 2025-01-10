const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Attendance = require('../models/Attendance'); // Model dosyanızın yolu

// Haftaları çekmek için API
router.get('/weeks', async (req, res) => {
  try {
    const { classId, studentId } = req.query; // Query params'dan classId ve studentId al

    console.log('Received classId:', classId);
    console.log('Received studentId:', studentId);
    

    if (!classId || !studentId) {
      return res.status(400).json({ error: 'classId and studentId are required' });
    }

    const studentObjectId = new mongoose.Types.ObjectId(studentId);


    // Attendance verilerini çek (örneğin firstSemester için)
    const attendanceData = await Attendance.find({ semester: 'firstSemester' }).lean();
    console.log('Attendance data:', attendanceData);

    // Haftalar ve katılım durumunu hazırlama
    const weeksData = attendanceData.flatMap(attendance =>
      (attendance.weeks || []).map(week => {
        const course = week.courses.find(c => c.courseCode === classId);

        const status = course && course.attendance.some(att => att.studentId.toString() === studentObjectId.toString())
          ? 'Attended'
          : 'Not Attended';

        return {
          weekNumber: week.weekNumber,
          startDate: week.startDate,
          endDate: week.endDate,
          status, // Attended veya Not Attended
        };
      })
    );

    // weeksData'nın array olduğundan emin olun
    console.log('Processed weeks data:', weeksData);
    res.json(Array.isArray(weeksData) ? weeksData : []);

  } catch (error) {
    console.error("Error fetching weeks data:", error);
    res.status(500).send("Error fetching weeks data");
  }
});

module.exports = router;
