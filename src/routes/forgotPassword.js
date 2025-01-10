const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const mongoose = require('mongoose');
const crypto = require('crypto');
const nodemailer = require('nodemailer'); // Nodemailer importu eklendi
const User = require('../models/User'); // Kullanıcı modelini import edin
require('dotenv').config();  // .env dosyasını yükle

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        // Kullanıcıyı bul
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Şifre sıfırlama token oluştur
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 dakika geçerlilik
        await user.save();

        // Şifre sıfırlama bağlantısı oluştur
        const resetUrl = `http://localhost:3000/resetPassword.html?token=${resetToken}`;
        const message = `You are receiving this email because of a request of password reset. Click the link below to reset your password: \n\n ${resetUrl}`;

        // Email gönder
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        await transporter.sendMail({
            to: user.email,
            subject: 'Password Reset Request',
            text: message,
        });

        res.status(200).json({ message: 'Password reset link sent to your email' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error sending email. Please try again later.' });
    }
});

router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        // Token'ı hashleyerek veritabanında arama yap
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Token'ı ve süresi geçerli olan kullanıcıyı bul
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Yeni şifreyi hashle
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Şifreyi güncelle ve token'ları sıfırla
        user.password = hashedPassword;
        user.resetPasswordToken = undefined; // Token'ı sıfırla
        user.resetPasswordExpire = undefined; // Expire'ı sıfırla
        await user.save();

        res.status(200).json({ message: 'Password has been successfully updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error resetting password. Please try again later.' });
    }
});

module.exports = router;