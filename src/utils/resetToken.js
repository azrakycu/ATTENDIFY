const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Kullanıcı modelinizi içe aktarın
const connectDB = require('../config/db'); // MongoDB bağlantı fonksiyonunu içe aktar

// Kullanıcıları güncelleyen fonksiyon
const resetTokenFields = async () => {
    try {
        // MongoDB'ye bağlan
        await connectDB();

        // Kullanıcıları güncelleme işlemi
        const result = await User.updateMany({}, {
            $set: {
                resetPasswordToken: null,
                resetPasswordExpire: null
            }
        });

        console.log(`Updated ${result.nModified} users with reset token fields.`);
    } catch (err) {
        console.error('Error updating users:', err);
    } finally {
        mongoose.disconnect(); // Bağlantıyı kapat
    }
};

module.exports = resetTokenFields;
