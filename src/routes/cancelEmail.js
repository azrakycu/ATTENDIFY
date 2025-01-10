const express = require('express');
const nodemailer = require('nodemailer');
const User = require('../models/User'); // Öğrencileri bulmak için User modelini kullanıyoruz
const router = express.Router();
require('dotenv').config();  // .env dosyasını yükle

// Ders iptalinin öğrencilerle paylaşılması için e-posta gönderimi
router.post('/sendCancellationEmails', async (req, res) => {
    const { classname, weeknumber } = req.body;

    try {
        // "SENG" kısmını kaldırıyoruz
        const cleanedClassname = classname.replace('SENG', '').trim();

        // Öğrencileri buluyoruz
        const students = await User.find({ role: 'student' });

        if (students.length === 0) {
            return res.status(404).json({ success: false, message: "No students found" });
        }

        // Nodemailer ile e-posta göndermek için transporter ayarlıyoruz
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Gmail üzerinden göndereceğiz, başka bir sağlayıcı da kullanılabilir
            auth: {
                user: process.env.EMAIL_USER, // Gmail kullanıcı adı (env dosyasından alıyoruz)
                pass: process.env.EMAIL_PASS  // Gmail şifresi (env dosyasından alıyoruz)
            }
        });

        // E-posta gönderme işlemi
        const emailPromises = students.map(student => {
            const mailOptions = {
                from: process.env.EMAIL_USER, // E-posta adresiniz
                to: student.email, // Öğrencinin e-posta adresi
                subject: `Class Cancellation Notice: ${classname} - Week ${weeknumber}`,
                text: `Dear ${student.username} ${student.surname},\n\nWe regret to inform you that the class ${classname} scheduled for Week ${weeknumber} has been canceled.\n\nBest regards,\nAttendify`
            };

            return transporter.sendMail(mailOptions);
        });

        // E-postaları gönderiyoruz
        await Promise.all(emailPromises);

        return res.json({ success: true, message: `Cancellation emails have been sent to all students for ${classname} - Week ${weeknumber}` });
    } catch (error) {
        console.error('Error sending cancellation emails:', error);
        return res.status(500).json({ success: false, message: 'An error occurred while sending cancellation emails.' });
    }
});

module.exports = router;
