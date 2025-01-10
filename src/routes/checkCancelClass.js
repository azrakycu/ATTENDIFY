const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Attendance = require('../models/Attendance');


router.post('/checkCancelStatus', async (req, res) => {
    const { classname, weeknumber } = req.body;
    try {

        // Haftayı buluyoruz
        const attendance = await Attendance.findOne({ "weeks.weekNumber": weeknumber });

        if (!attendance) {
            return res.status(404).json({ success: false, message: "Attendance not found" });
        }

        // Haftayı ve kursu buluyoruz
        const week = attendance.weeks.find(week => week.weekNumber === weeknumber);
        if (!week) {
            return res.status(404).json({ success: false, message: "Week not found" });
        }

        const course = week.courses.find(course => course.courseCode === classname);
        if (!course) {
            return res.status(404).json({ success: false, message: `Course not found: ${classname}` });
        }

        // isCanceled alanını kontrol et
        console.log('mtsatus:' , course.isCanceled);
        return res.json({ success: true, isCanceled: course.isCanceled });
    } catch (error) {
        console.error("Error in /check-cancel-status:", error);
        res.status(500).json({ success: false, message: "An error occurred. Please try again." });
    }
});

module.exports = router;