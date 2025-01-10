// controller.js dosyanız
const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');

// Haftalardaki attendance arraylerini temizleyen fonksiyon
async function clearAttendance() {
    try {
        // Tüm Attendance verilerini alıyoruz
        const attendanceData = await Attendance.find({});

        // Her bir attendance verisinin içindeki weeks array'inde gezip attendance array'lerini temizliyoruz
        for (let semester of attendanceData) {
            for (let week of semester.weeks) {
                // Her bir hafta için attendance array'ini temizliyoruz
                week.courses.forEach(course => {
                    course.attendance = [];
                });
            }
            // Değişiklikleri kaydediyoruz
            await semester.save();
        }

        console.log('Tüm attendance kayıtları başarıyla temizlendi.');
    } catch (error) {
        console.error('Hata oluştu:', error.message);
    }
}

// ClearAttendance fonksiyonunu doğrudan burada çalıştırıyoruz
clearAttendance(); // Bu fonksiyon bir kez çalışacak
