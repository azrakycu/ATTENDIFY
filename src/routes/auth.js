const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Class = require('../models/Class');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');



// Kullanıcı kayıt rotası
router.post('/register', async (req, res) => {
    const { username, surname, studentId, email, password, role } = req.body;

    // Gelen veriyi kontrol etmek için log
    console.log('Request body:', req.body);

    if (!role || !['teacher', 'student'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' }); // Role kontrolü
    }

    try {
        // Kullanıcı zaten kayıtlı mı?
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        // Şifreyi hash'le
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Yeni kullanıcı oluştur
        const newUser = new User({
            username,
            surname,
            studentId,
            email,
            password: hashedPassword,
            role,
        });

        await newUser.save();
        console.log(`User Registered: ${username}, ${email}, Role: ${role}`);

        // Eğer kullanıcı "student" ise derslere ekleme işlemi yap
        if (role === 'student') {
            const classesToUpdate = await Class.updateMany(
                { classId: { $in: ['SENG209', 'SENG211'] } }, // Belirli dersler
                { $push: { students: { objectId: newUser._id, studentId: newUser.studentId } } } // Hem ObjectId hem studentId ekle
            );
            console.log(`${classesToUpdate.modifiedCount} classes updated for new student.`);
        }

        res.status(201).json({ message: 'User registered successfully!', user: { username, role } });
    } catch (err) {
        console.error(`Error: ${err.message}`);
        if (!res.headersSent) {
            return res.status(500).json({ error: err.message });
        }
    }
});

// Kullanıcı giriş rotası
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Kullanıcıyı email ile bulma
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Şifre doğrula
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // JWT Token oluşturma
        const token = jwt.sign(
            { id: user._id, role: user.role }, // Role bilgisi token içine ekleniyor
            process.env.JWT_SECRET, // JWT Secret'ı kullan
            { expiresIn: '1h' } // Token geçerlilik süresi
        );

        // Role ve token bilgisi döndür
        res.status(200).json({
            message: 'Login successful',
            token,
            role: user.role // Kullanıcının rolü frontend'e gönderiliyor
        });
    } catch (err) {
        console.error(`Error during login: ${err.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Profil Bilgisi
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({
            username: user.username,
            surname: user.surname,
            email: user.email,
            role: user.role,
            _id: user._id, 
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error.' });
    }
});

module.exports = router;



