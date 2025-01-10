const mongoose = require('mongoose');

// Ders Schema'sı
const classSchema = new mongoose.Schema({
  classId: { type: String, required: true, unique: true }, // Her ders için benzersiz ID
  teacherId: { type: String, required: true }, // Dersi oluşturan öğretmen ID'si
  className: { type: String, required: true }, // Dersin adı
  students: [
    {
      studentId: { type: String, required: true }, // Öğrencinin numarası
      objectId: { type: String, ref: 'User', required: true }, // Öğrencinin User koleksiyonundaki ObjectId'si
    },
  ],
});

module.exports = mongoose.model('Class', classSchema);

