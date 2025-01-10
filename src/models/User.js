const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true},
    surname: { type: String, required: true }, 
    studentId: { type: String, required: true }, 
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['teacher', 'student'], 
        required: true 
    },
    resetPasswordToken: { type: String }, // Şifre sıfırlama tokeni
    resetPasswordExpire: { type: Date }, // Tokenin geçerlilik süresi
});


module.exports = mongoose.model('User', UserSchema);

