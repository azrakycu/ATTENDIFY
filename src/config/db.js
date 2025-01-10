require('dotenv').config();

const mongoose = require('mongoose'); // mongoose modülünü ekleyin

// MongoDB'ye bağlanma fonksiyonu
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Zaman aşımı 5 saniye

            useNewUrlParser: true, // Gereksiz ama eski sürümle uyumluluk için eklenebilir
            useUnifiedTopology: true, // Gereksiz ama eski sürümle uyumluluk için eklenebilir
        });
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err.message);
        process.exit(1); // Hata durumunda uygulama durur
    }
};

module.exports = connectDB; // Fonksiyonu dışa aktarıyoruz ki başka dosyalarda kullanabilelim.