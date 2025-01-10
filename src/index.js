require('dotenv').config(); // .env dosyasını yükle
const cors = require('cors'); // CORS modülünü import et
const express = require('express');
const path = require('path');
const connectDB = require('./config/db'); // Veritabanı bağlantısı için db.js dosyasını import et
const authRoutes = require('./routes/auth'); // Yetkilendirme rotalarını import et
const checkRoutes = require('./routes/check'); // Yetkilendirme rotalarını import et
const controlRoutes = require('./routes/control');
//const { clearAttendance } = require('./routes/temizlik'); // clearAttendance fonksiyonunu içeri aktarma
const attendanceRoutes = require('./routes/attendanceRoutes'); // Attendance routes import edildi
const weeksRoutes = require('./routes/weeksRoutes'); // Attendance routes import edildi
const forgotPassword = require('./routes/forgotPassword'); // Attendance routes import edildi
//const resetTokenFields = require('./utils/resetToken');
const contactUsRoutes = require('./routes/contactUsRoutes');
const contactTeacherRoutes = require('./routes/contactTeacherRoutes');
const isCanceledRoute = require('./routes/isCanceled');
//const canceledEmailRoute = require('./routes/cancelEmail');



const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB URI'nin yüklendiğinden emin olmak için loglama
console.log('Mongo URI:', process.env.MONGO_URI);

// Veritabanına bağlanma
connectDB();

// Middleware'ler
app.use(cors()); // Tüm gelen istekler için CORS'u etkinleştir
app.use(express.json()); // Gelen JSON verilerini okumak için JSON parser middleware
app.use(express.static(path.join(__dirname, '../public'))); // Public klasöründeki statik dosyaları sunmak için

// Ana sayfa yönlendirmesi (SignUp sayfası)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'home.html'));
});

// Öğretmen sayfası yönlendirmesi
app.get('/teacherPage', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'teacherPage.html'));
});

// Öğrenci sayfası yönlendirmesi
app.get('/studentPage', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'studentPage.html'));
});

// Welcome sayfası yönlendirmesi
app.get('/welcome', (req, res) => {
    // Örnek: Authorization başlığından token kontrolü yap
    const token = req.headers.authorization?.split(' ')[1]; // "Bearer valid-token" formatında token al

    if (!token || token !== 'valid-token') { // Örnek token kontrolü (Kendi doğrulama mekanizmanızı kullanın)
        return res.status(401).send('Unauthorized'); // Yetkisiz erişim için hata döndür
    }

    // Token geçerliyse welcome.html dosyasını gönder
    res.sendFile(path.join(__dirname, '../public', 'welcome.html'));
});


// Yetkilendirme rotaları
app.use('/api/auth', authRoutes);
app.use('/api/check', checkRoutes);
app.use('/api/control', controlRoutes);
app.use('/api/attendanceRoutes', attendanceRoutes);
app.use('/api/weeksRoutes', weeksRoutes);
app.use('/api/forgotPassword', forgotPassword);
app.use('/api/contactUsRoutes', contactUsRoutes);
app.use('/api/contactTeacherRoutes', contactTeacherRoutes);
app.use('/api/isCanceled', isCanceledRoute);
//app.use('/api/cancelEmail', canceledEmailRoute);



// Routes
const classRoutes = require('./routes/classes');
app.use('/api/classes', classRoutes);

//const checkCancelClassRoutes = require('./routes/checkCancelClass');
//app.use('/api/checkCancelClass', checkCancelClassRoutes);


// Veritabanı bağlantısı
const dbURI = process.env.MONGO_URI; // Config Vars'tan çekiliyor
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected successfully');
    //clearAttendance(); // Uygulama başladığında attendance temizleme işlemi başlatılır
})
.catch((error) => console.error('MongoDB connection error:', error.message));

//(async () => {
//    await resetTokenFields(); // Kullanıcıları güncelle
//})();
// Sunucu başlatılıyor
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
