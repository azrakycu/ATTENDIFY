const express = require('express');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const User = require('../models/User'); // Öğrencileri bulmak için User modelini kullanıyoruz
const router = express.Router();
require('dotenv').config();  // .env dosyasını yükle

// Dersin iptal edilmesi ve e-posta gönderimi
router.post('/cancelClass', async (req, res) => {
    const { classname, weeknumber } = req.body;

    try {
        // "SENG" kısmını kaldırıyoruz
        const cleanedClassname = classname.replace('SENG', '').trim();

        // Haftayı buluyoruz
        const attendance = await Attendance.findOne({ "weeks.weekNumber": weeknumber });

        if (!attendance) {
            return res.status(404).json({ success: false, message: "Attendance not found" });
        }

        // Haftayı ve kursu buluyoruz
        const week = attendance.weeks.find(week => week.weekNumber === weeknumber);
        if (!week) {
            return res.status(404).json({ success: false, message: "Week not found" });
        }

        // Burada sadece kurs kodunu `classname` ile karşılaştırıyoruz
        const course = week.courses.find(course => course.courseCode === cleanedClassname);
        if (!course) {
            return res.status(404).json({ success: false, message: `Course not found: ${classname}` });
        }

        // isCanceled alanını true yapıyoruz
        course.isCanceled = true;
        await attendance.save();

        // Öğrencileri buluyoruz
        const students = await User.findOne({ role: 'student' });
        console.log(students); // Öğrencilerin e-posta adreslerini kontrol edin


        if (students.length === 0) {
            return res.status(404).json({ success: false, message: "No students found" });
        }

        // Nodemailer ile e-posta göndermek için transporter ayarlıyoruz
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Gmail üzerinden göndereceğiz, başka bir sağlayıcı da kullanılabilir
            auth: {
                user: process.env.EMAIL_USERNAME, // Gmail kullanıcı adı (env dosyasından alıyoruz)
                pass: process.env.EMAIL_PASSWORD  // Gmail şifresi (env dosyasından alıyoruz)
            },
            debug: true, // Hata ayıklama
            logger: true, // Loglama
        });
        // Test bağlantısı
        transporter.verify((error, success) => {
         if (error) {
             console.error('Transporter Error:', error);
         } else {
             console.log('Server is ready to take messages:', success);
         }
});

        // E-posta gönderme işlemi
        const emailPromises = students.map(student => {
            console.log('Sending email to:', student.email);
            const mailOptions = {
                from: process.env.EMAIL_USERNAME, // E-posta adresiniz
                to: student.email, // Öğrencinin e-posta adresi
                subject: `Class Cancellation Notice: ${classname} - Week ${weeknumber}`,
                text: `Dear ${student.username} ${student.surname},\n\nWe regret to inform you that the class ${classname} scheduled for Week ${weeknumber} has been canceled.\n\nBest regards,\nAttendify`
            };

            return transporter.sendMail(mailOptions);
        });

        // E-postaları gönderiyoruz
        await Promise.all(emailPromises);

        // Ders iptal ve e-posta gönderme işlemi başarılı
        return res.json({ success: true, message: `Class ${classname} for week ${weeknumber} has been canceled and emails have been sent to all students.` });

    } catch (error) {
        console.error('Error in /cancelClass:', error);  // Hata detaylarını logluyoruz
        return res.status(500).json({ success: false, message: 'An error occurred while processing the request.' });
    }
});

module.exports = router;

