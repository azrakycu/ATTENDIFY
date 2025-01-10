const mongoose = require('mongoose');
const Attendance = require('../models/Attendance'); // Attendance model
const Class = require('../models/Class'); // Class model
const User = require('../models/User'); // User model



// Öğrencinin katılım durumunu kontrol etme fonksiyonu
const getAttendanceStatus = async (req, res) => {
    const { studentId, classId } = req.query;  // Giriş yapan öğrencinin ID'si ve ders kodu
    try {
        // First semester için attendance verilerini alıyoruz
        const attendanceData = await Attendance.findOne({ semester: 'firstSemester' });

        if (!attendanceData) {
            return res.status(404).send("Attendance data not found for first semester.");
        }

        // Haftaları ve dersleri dolaşarak öğrencinin katılım durumu "attended" mi kontrol ediyoruz
        attendanceData.weeks.forEach(week => {
            week.courses.forEach(course => {
                if (course.courseCode === classId) {  // Ders kodu eşleşirse
                    // Öğrenci mevcutsa, katılım durumu "attended" olarak döndürülecek
                    course.attendance.forEach(attendance => {
                        if (attendance.studentId.toString() === studentId) {
                            attendance.attendanceStatus = 'attended';  // Burada sadece frontend için yansıtırız
                        }
                    });
                }
            });
        });

        // Katılım verisini frontend'e gönderiyoruz
        res.status(200).json(attendanceData.weeks);
    } catch (error) {
        console.error("Error fetching attendance data:", error);
        res.status(500).send("Error fetching attendance data.");
    }
};

module.exports = { getAttendanceStatus };

