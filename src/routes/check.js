const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const router = express.Router();

const jwt = require('jsonwebtoken');

router.post('/passkey', async (req, res) => {
    const { courseCode } = req.body; // Sadece courseCode alınıyor
    console.log("Received courseCode:", courseCode);
  
    try {
        const currentWeek = new Date();
        const startOfWeek = new Date(currentWeek);
        startOfWeek.setDate(currentWeek.getDate() - currentWeek.getDay() + 1);
  
        const startOfWeekWithoutTime = new Date(startOfWeek.setHours(0, 0, 0, 0));
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999); // Son saat
  
        console.log("step1");
  
        const passkeyData = await Attendance.findOne({
            'weeks.startDate': {
                $gte: startOfWeekWithoutTime,
                $lt: new Date(endOfWeek.setHours(23, 59, 59, 999))
            }
        });
  
        console.log("step2");
  
        if (!passkeyData) {
            console.log('Passkey data not found!');
            return res.status(404).json({ message: 'No data found for the week!' });
        }
  
        const weekData = passkeyData.weeks.find(week => {
            const weekStartDate = new Date(week.startDate);
            weekStartDate.setHours(0, 0, 0, 0);
            return weekStartDate.getTime() === startOfWeekWithoutTime.getTime();
        });
  
        if (!weekData) {
            console.log('Week data not found!');
            return res.status(404).json({ message: 'Week information not found!' });
        }
  
        console.log('weekData:', weekData);
  
        const courseData = weekData.courses.find(course => course.courseCode === courseCode);
  
        if (!courseData) {
            return res.status(404).json({ message: 'Course information not found!' });
        }
  
        res.json({ message: 'Passkey successfully retrieved', passkey: courseData.passkey });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error!' });
    }
  });
  
  module.exports = router;
  