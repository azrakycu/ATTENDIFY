const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();


// MongoDB bağlantısı için model dosyanızı oluşturun (örneğin User ve Attendance modelleri)
const User = require('./src/models/User.js'); // User modelini dahil et
const Attendance = require('./src/models/Attendance.js'); 

const app = express();

// JSON veri almak için middleware
app.use(express.json());

// MongoDB bağlantısı
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// API Endpoint: Öğretmenin kullanıcı adı ve şifresini doğrulayıp passkey döndürme
app.post('/passkey', async (req, res) => {
  const { username, password } = req.body;
  console.log("Received username:", username);
  console.log("Received password:", password);

  try {
    // Kullanıcı adıyla veritabanında öğretmen arama
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı!' }); // 404 Kullanıcı bulunamadı
    }

    // Şifreyi kontrol et
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Yanlış şifre!' }); // 400 Yanlış şifre
    }

    // Haftanın passkey'ini veritabanından al
    const currentWeek = new Date();
    const startOfWeek = new Date(currentWeek);
    startOfWeek.setDate(currentWeek.getDate() - currentWeek.getDay() + 1); // Pazartesi'yi başlangıç al

    // Sadece tarih kısmını karşılaştırmak için saat, dakika, saniye ve milisaniyeleri sıfırlıyoruz
    const startOfWeekWithoutTime = new Date(startOfWeek.setHours(0, 0, 0, 0));
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Haftanın sonu (Pazar)

    // Haftanın passkey'ini almak için sorgu
    const passkeyData = await Attendance.findOne({
      'weeks.startDate': {
        $gte: startOfWeekWithoutTime,
        $lt: new Date(endOfWeek.setHours(23, 59, 59, 999)) // Haftanın sonu
      }
    });

    if (!passkeyData) {
      return res.status(404).json({ message: 'Passkey bulunamadı!' });
    }

    // Haftanın passkey'ini döndür
    const passkey = passkeyData.weeks.find(week => {
      const weekStartDate = new Date(week.startDate);
      return weekStartDate.getTime() === startOfWeekWithoutTime.getTime(); // Tarih karşılaştırması
    });

    if (!passkey) {
      return res.status(404).json({ message: 'Passkey bulunamadı!' });
    }

    res.json({ message: 'Passkey başarıyla alındı', passkey: passkey.passkey });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası!' });
  }
});

// Sunucuyu başlat
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
