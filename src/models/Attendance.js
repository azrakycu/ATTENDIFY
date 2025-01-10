const mongoose = require('mongoose');

// Haftaların yapısını tanımlıyoruz
const weekSchema = new mongoose.Schema({
  weekNumber: { type: Number, required: true }, // Haftanın numarası
  startDate: { type: Date, required: true },   // Haftanın başlangıç tarihi
  endDate: { type: Date, required: true },     // Haftanın bitiş tarihi
  courses: [
    {
      courseCode: { type: String, required: true }, // Ders kodu (örn: 209, 211)
      passkey: { type: String, required: true },    // Bu dersin şifresi
      isCanceled: { type: Boolean, default: false }, // Yeni alan
      attendance: [
        {
          studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
          attendanceStatus: String, // 'present', 'absent', vs.
          date: Date,
        },
      ],
    },
  ],
});

// Attendance koleksiyonu, her dönem ve haftayı içerecek şekilde tanımlanıyor
const attendanceSchema = new mongoose.Schema({
  semester: { type: String, enum: ['firstSemester', 'secondSemester'], required: true }, // Dönem (Örn: İlk dönem, ikinci dönem)
  weeks: [weekSchema], // Haftalar
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
