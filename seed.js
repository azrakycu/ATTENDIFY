const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const User = require('./src/models/User');
//const Class = require('./src/models/Class');  // Class modelini import edin
const Attendance = require('./src/models/Attendance');
require('dotenv').config();
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// MongoDB bağlantısını başlatıyoruz
 mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('MongoDB connected successfully');
    await startSeeding();
    mongoose.connection.close();
  })
  .catch((error) => console.error('MongoDB connection error:', error.message));

// Haftanın başlangıç tarihine dayalı bir şifre oluşturur
const generatePasskey = (input, length = 8) => {
  const hash = crypto.createHash('sha256');
  hash.update(input); // String olarak girdiyi hash'ler
  return hash.digest('hex').substring(0, length);
};

// Haftaları oluşturma ve ders ekleme fonksiyonu
const generateWeeksWithCourses = (startDate) => {
  const weeks = [];
  let currentDate = new Date(startDate);

  for (let i = 1; i <= 18; i++) {
    const start = new Date(currentDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    const weekCourses = [
      {
        courseCode: '209',
        passkey: generatePasskey(`${start.toISOString()}-209`),
        attendance: [], // Başlangıçta boş
      },
      {
        courseCode: '211',
        passkey: generatePasskey(`${start.toISOString()}-211`),
        attendance: [], // Başlangıçta boş
      },
    ];

    weeks.push({
      weekNumber: i,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      courses: weekCourses, // Dersleri haftaya ekliyoruz
    });

    currentDate.setDate(currentDate.getDate() + 7);
  }

  return weeks;
};

// Veritabanını seed etme fonksiyonu
async function seedData() {
  try {
    const existingFirstSemester = await Attendance.findOne({ semester: 'firstSemester' });
    const existingSecondSemester = await Attendance.findOne({ semester: 'secondSemester' });

    const firstSemesterWeeks = generateWeeksWithCourses('2024-09-16');
    const secondSemesterWeeks = generateWeeksWithCourses('2025-02-01');

    if (!existingFirstSemester) {
      const firstSemester = new Attendance({
        semester: 'firstSemester',
        weeks: firstSemesterWeeks,
      });
      await firstSemester.save();
      console.log('First semester attendance verisi başarıyla eklendi!');
    }

    if (!existingSecondSemester) {
      const secondSemester = new Attendance({
        semester: 'secondSemester',
        weeks: secondSemesterWeeks,
      });
      await secondSemester.save();
      console.log('Second semester attendance verisi başarıyla eklendi!');
    }
  } catch (error) {
    console.error('Veri eklenirken hata oluştu:', error.message);
  }
}

// Mevcut haftaların passkey'lerini güncelleme fonksiyonu
async function updatePasskeysForExistingWeeks() {
  try {
    const semesters = await Attendance.find({}); // Tüm semester'ları alıyoruz

    for (const semesterData of semesters) {
      let isUpdated = false; // Güncelleme yapılacak mı kontrolü

      for (const week of semesterData.weeks) {
        if (!week.courses || week.courses.length === 0) {
          // Eğer courses alanı yoksa, yeni course ekliyoruz
          week.courses = [
            {
              courseCode: '209',
              passkey: generatePasskey(`${week.startDate}-209`),
              attendance: [],
            },
            {
              courseCode: '211',
              passkey: generatePasskey(`${week.startDate}-211`),
              attendance: [],
            },
          ];
          isUpdated = true; // Güncelleme yapıldı
        } else {
          // Mevcut course'ların passkey'lerini güncelliyoruz
          for (const course of week.courses) {
            course.passkey = generatePasskey(`${week.startDate}-${course.courseCode}`);
          }
          isUpdated = true; // Güncelleme yapıldı
        }
      }

      if (isUpdated) {
        // Değişiklikler varsa güncellenmiş veriyi kaydediyoruz
        await Attendance.updateOne(
          { _id: semesterData._id },
          { $set: { weeks: semesterData.weeks } }
        );
        console.log(`${semesterData.semester} güncellendi.`);
      }
    }
  } catch (error) {
    console.error('Veri güncellenirken hata oluştu:', error.message);
  }
}

//async function clearStudents() {
//  try {
//    // Tüm Class belgelerinde students alanını boş bir array ile güncelle
//    await Class.updateMany(
//      {},
//      { $set: { students: [] } }
//    );
//    console.log('All students arrays have been cleared.');
//  } catch (error) {
//    console.error('Error clearing students:', error.message);
//  }
//}


// Seeding işlemini başlat
async function startSeeding() {
  console.log("Starting seeding process...");
  //await clearStudents();  // Öğrenciler temizlendikten sonra veriler seed edilsin
  await seedData();
  console.log("Seeding completed");

  console.log("Starting passkey update for existing weeks...");
  await updatePasskeysForExistingWeeks(); // Mevcut haftaların passkey'lerini güncelle
  console.log("Passkey update completed.");
}


