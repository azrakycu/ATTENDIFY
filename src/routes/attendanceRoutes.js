const express = require('express');
const mongoose = require('mongoose');
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const router = express.Router();

// Endpoint: Katılım bilgilerini almak için POST isteği
router.post('/attendance', async (req, res) => {
    const { classId, weekNumber } = req.body; // classId (209), weekNumber'ı request body'den alıyoruz
  
    try {
        // Class'ı buluyoruz (classId burada 'SENG209' gibi değil, '209' olacak)
        const classData = await Class.findOne({ classId: `SENG${classId}` }); // classId'yi 'SENG' ile birleştiriyoruz
  
        if (!classData) {
            return res.status(404).json({ message: 'Class not found' });
        }
  
        // Attendance verisini buluyoruz
        const attendanceData = await Attendance.findOne({
            semester: 'firstSemester', // Örnek olarak ilk dönemi alıyoruz
            'weeks.weekNumber': parseInt(weekNumber),
        });
  
        if (!attendanceData) {
            return res.status(404).json({ message: 'Attendance data not found for this week' });
        }
  
        // Seçilen haftanın katılım verisini alıyoruz
        const week = attendanceData.weeks.find(week => week.weekNumber === parseInt(weekNumber));
  
        // Kursu (dersi) buluyoruz
        const course = week.courses.find(course => course.courseCode === classId); // classId burada '209' olacak
  
        if (!course) {
            return res.status(404).json({ message: 'Course not found for this class' });
        }
  
        // Derse kayıtlı tüm öğrenciler
        const registeredStudents = classData.students;
  
        // Öğrencilerin katılım bilgilerini hazırlıyoruz
        const attendanceDetails = await Promise.all(
            registeredStudents.map(async studentData => {
                // Öğrencinin kimliği ile kullanıcı verisini alıyoruz
                const student = await User.findById(studentData.objectId);
                console.log('Student Data:', studentData);
  
                // Katılım bilgilerini arıyoruz
                const attendanceRecord = course.attendance.find(att => String(att.studentId) === String(student._id));
                console.log("seni buldum.",student._id);
  
                // Eğer öğrenci katılmadıysa "absent" olarak işaretle
                const attendanceStatus = attendanceRecord ? attendanceRecord.attendanceStatus : 'absent';
  
                return {
                    studentId: student.studentId,
                    username: student.username,
                    surname: student.surname,
                    attendanceStatus: attendanceStatus,
                };
            })
        );
  
        res.json({ attendance: attendanceDetails });
    } catch (error) {
        console.error('Error fetching attendance data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
  });

module.exports = router;