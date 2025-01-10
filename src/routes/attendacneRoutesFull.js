const express = require('express');
const mongoose = require('mongoose');
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');
const User = require('../models/User');

const router = express.Router();


router.post('/attendance-full', async (req, res) => {
    const { classId } = req.body; // sadece classId alıyoruz

    try {
        // Class'ı buluyoruz (classId burada 'SENG209' gibi değil, '209' olacak)
        const classData = await Class.findOne({ classId: `SENG${classId}` });

        if (!classData) {
            return res.status(404).json({ message: 'Class not found' });
        }

        // Attendance verisini buluyoruz
        const attendanceData = await Attendance.findOne({
            semester: 'firstSemester', // Örnek olarak ilk dönemi alıyoruz
            'weeks.weekNumber': { $gte: 1 }  // 1. haftadan sonrasına kadar tüm haftaları alıyoruz
        });

        if (!attendanceData) {
            return res.status(404).json({ message: 'Attendance data not found for this semester' });
        }

        // Öğrencilerin katılım bilgilerini hazırlıyoruz
        const attendanceDetails = await Promise.all(
            classData.students.map(async studentData => {
                // Öğrencinin kimliği ile kullanıcı verisini alıyoruz
                const student = await User.findById(studentData.objectId);
                const attendanceForStudent = [];

                // Tüm haftalar için katılım bilgilerini alıyoruz
                for (let week of attendanceData.weeks) {
                    const course = week.courses.find(course => course.courseCode === classId);
                    const attendanceRecord = course ? course.attendance.find(att => String(att.studentId) === String(student._id)) : null;
                    const attendanceStatus = attendanceRecord ? attendanceRecord.attendanceStatus : 'absent';
                    attendanceForStudent.push(attendanceStatus);
                }

                return {
                    studentId: student.studentId,
                    username: student.username,
                    surname: student.surname,
                    attendanceStatus: attendanceForStudent
                };
            })
        );

        res.json({ attendance: attendanceDetails });
    } catch (error) {
        console.error('Error fetching attendance data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
