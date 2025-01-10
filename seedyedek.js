const express = require('express');
const crypto = require('crypto');
const User = require('./src/models/User');
const Class = require('./src/models/Class');
const Attendance = require('./src/models/Attendance');
require('dotenv').config();
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

currentWeek.attendance.push({
  studentId: new ObjectId(),  // Burada ObjectId oluşturuyoruz
  attendanceStatus: 'present',
  date: today,
  passkey: passkey,
});


const app = express();
const port = process.env.PORT || 3000; 

// MongoDB bağlantısını başlatıyoruz
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((error) => console.error('MongoDB connection error:', error.message));

// Haftanın başlangıç tarihine dayalı bir şifre oluşturur
const generatePasskey = (weekStartDate, length = 8) => {
  if (!(weekStartDate instanceof Date) || isNaN(weekStartDate)) {
    throw new TypeError('weekStartDate geçerli bir Date nesnesi olmalı!');
  }

  const hash = crypto.createHash('sha256');
  hash.update(weekStartDate.toISOString()); // Tarihi ISO formatında güncelle
  return hash.digest('hex').substring(0, length); // Belirtilen uzunlukta şifre döndür
};

// Haftalık şifreyi döndüren API
app.get('/api/passkey', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Saat, dakika, saniye sıfırlanıyor
    const firstSemester = await Attendance.findOne({ semester: 'firstSemester' });
    
    if (!firstSemester) {
      return res.status(404).send('Attendance data not found.');
    }

    const currentWeek = firstSemester.weeks.find(week => {
      const startDate = new Date(week.startDate);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(week.endDate);
      endDate.setHours(0, 0, 0, 0);

       // Tarihleri logla
       console.log("Start Date (ISO):", startDate.toISOString());
       console.log("End Date (ISO):", endDate.toISOString());
       console.log("Today's Date (ISO):", today.toISOString());

      return today >= startDate && today <= endDate;
    });

    if (currentWeek) {
      const passkey = generatePasskey(currentWeek.startDate);  // Haftanın şifresi
      res.json({ passkey, weekNumber: currentWeek.weekNumber });
    } else {
      res.status(404).send('Current week not found.');
    }
  } catch (error) {
    res.status(500).send('Internal server error.');
  }
});
// Haftanın başlangıç tarihini almak için bir fonksiyon
function getStartOfWeek(date) {
  const day = date.getDay(),
        diff = date.getDate() - day + (day === 0 ? -6 : 1); // Pazartesi günü
  return new Date(date.setDate(diff));
}

// Haftalara başlangıç ve bitiş tarihlerini ekleyelim
async function seedData() {
  try {
    const generateWeeks = (startDate) => {
      const weeks = [];
      let currentDate = new Date(startDate);
  
      for (let i = 1; i <= 18; i++) {
        const start = new Date(currentDate);
        const end = new Date(start);
        end.setDate(end.getDate() + 6); // Haftanın bitiş tarihini ayarla
  
        weeks.push({
          weekNumber: i,
          startDate: start, // Date nesnesi olarak saklanıyor
          endDate: end,     // Date nesnesi olarak saklanıyor
          attendance: [],   // Yoklama başlangıçta boş
        });
  
        currentDate.setDate(currentDate.getDate() + 7); // Sonraki haftaya geç
      }
  
      return weeks;
    };

    // Başlangıç tarihi: 16 Eylül 2024
    const weeks = generateWeeks('2024-09-16');
    console.log(weeks);  // Verinin doğru şekilde oluştuğunu kontrol etmek için
  
    // Bugünün tarihini al
    const today = new Date();
    console.log("Today is:", today);

    // Saat, dakika, saniye ve milisaniyeleri sıfırlayalım
    today.setHours(0, 0, 0, 0);

    // Hangi haftada olduğumuzu bulmak
    const currentWeek = weeks.find(week => {
      // Haftanın başlangıç ve bitiş tarihlerini de aynı şekilde sıfırlıyoruz
      const startDate = new Date(week.startDate);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(week.endDate);
      endDate.setHours(0, 0, 0, 0);

      return today >= startDate && today <= endDate;
    });

    if (currentWeek) {
      console.log(`Current week is Week ${currentWeek.weekNumber}`);
      
      // Haftaya dayalı şifreyi oluştur
      const passkey = generatePasskey(currentWeek.startDate);
      console.log(`Week ${currentWeek.weekNumber} için üretilen şifre:`, passkey);

      // Öğrenci katılım bilgisini eklemek
      currentWeek.attendance.push({
        studentId: 'student-id-example',  // Öğrenci ID'sini buraya ekleyin
        attendanceStatus: 'present',     // Katılım durumu (örneğin 'present' ya da 'absent')
        date: today,
        passkey: passkey,                // Şifreyi de katılım objesine ekliyoruz
      });

      console.log(`Attendance added for Week ${currentWeek.weekNumber}`);
    } else {
      console.log('Bugün herhangi bir haftada değil!');
    }
  
    // 1. Dönem için Attendance objesi oluştur
    const firstSemester = new Attendance({
      semester: 'firstSemester',
      weeks: weeks,
    });
  
    console.log("Saving first semester attendance...");
    await firstSemester.save();
  
    console.log('Attendance verisi başarıyla eklendi!');
  } catch (error) {
    console.error('Veri eklenirken hata oluştu:', error.message);
  }
}

// Seed işlemleri başlatılıyor
async function startSeeding() {
  console.log("Starting seeding process...");
  await seedData();
  console.log("Seeding completed");
}

startSeeding();
