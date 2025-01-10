const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Class = require ('../models/Class');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { getWeekStartEnd } = require('../utils/utils'); 

// Set tarih formatında UTC'ye dönüştürme işlevi
const setToUtc = (date) => {
    const newDate = new Date(date);
    return new Date(Date.UTC(newDate.getFullYear(), newDate.getMonth(), newDate.getDate(), 0, 0, 0));
};



router.post('/enterclass', async (req, res) => {
    const { studentId, passkey, courseCode } = req.body;

    try {
        // Step 1: Find the student by username
        const user = await User.findOne({ studentId });
        console.log("User");
        console.log('User:', user); // Kullanıcı verisini kontrol edin

        if (!user) {
            return res.json({ success: false, message: 'Student not found.' });
        }

        const { startOfWeek, endOfWeek } = getWeekStartEnd();
        console.log('Start of Week:', startOfWeek);
        console.log('End of Week:', endOfWeek);

        // Haftanın tarihlerini UTC'ye dönüştür
        const startOfWeekUTC = setToUtc(startOfWeek);
        const endOfWeekUTC = setToUtc(endOfWeek);

        // 3. Adım: Attendance veritabanında bu hafta için katılım verilerini bul
        const attendanceData = await Attendance.findOne({
            "weeks.startDate": {
                $gte: startOfWeekUTC, // UTC'ye ayarlandı
                $lt: endOfWeekUTC    // UTC'ye ayarlandı
            }
        });
        
        if (!attendanceData) {
            return res.json({ success: false, message: 'No attendance data found for this week.' });
        }
        //console.log("attendanceData:", attendanceData);
        //console.log("attendanceData.weeks:", attendanceData.weeks);

        // 4. Adım: Haftadaki dersleri kontrol et
        const courseInWeek = attendanceData.weeks.find(week => {
            console.log("Checking week:", week);

            const weekStart = new Date(week.startDate); // Haftanın başlangıcı
            const weekEnd = new Date(week.endDate); // Haftanın bitişi

            // Haftanın başlangıcı ve bitişi ile karşılaştırma yap
            return (
                setToUtc(weekStart).getTime() >= setToUtc(startOfWeek).getTime() &&
                setToUtc(weekEnd).getTime() <= setToUtc(endOfWeek).getTime()
            ) && week.courses.some(c => {
                console.log("Checking courseCode:", c.courseCode);
                return String(c.courseCode) === String(courseCode);
            });
        });

        if (!courseInWeek) {
            console.log("Course code or week does not match.");

            return res.json({ success: false, message: 'Course not found for this week or week does not match.' });
        }

        const selectedCourse = courseInWeek.courses.find(c => String(c.courseCode) === courseCode);

        // 5. Adım: Passkey doğrulama
        if (selectedCourse.passkey !== passkey) {
            
            return res.json({ success: false, message: 'Invalid passkey.' });
        }

        const studentAlreadyAttended = selectedCourse.attendance.some(att => {
            return String(att.studentId) === String(user._id);
        });

        if (studentAlreadyAttended) {
            return res.json({ success: false, message: 'You have already attended this class.' });
        }

        // 7. Adım: Katılım kaydını oluştur
        const studentAttendance = {
            studentId: user._id,
            attendanceStatus: 'present', // Durumu 'present' olarak belirledik
            date: new Date(),
        };

        // Haftadaki ilgili derse öğrenciyi ekle
        const courseIndex = courseInWeek.courses.findIndex(c => c.courseCode === courseCode);
        courseInWeek.courses[courseIndex].attendance.push(studentAttendance);

        // Attendance verisini kaydet
        await attendanceData.save();

        res.json({ success: true, message: 'Attendance recorded successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred. Please try again later.' });
    }
});



module.exports = router;