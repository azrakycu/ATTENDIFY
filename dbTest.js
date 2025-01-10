require('dotenv').config(); // .env dosyasını yükle
const mongoose = require('mongoose');

// MongoDB bağlantısını test etme fonksiyonu
const testConnection = async () => {
  try {
    // MongoDB'ye bağlanıyoruz
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true, // URL'yi yeni analizci ile çözümle
      useUnifiedTopology: true, // Birleşik topoloji kullan
    });

    console.log('MongoDB connection successful!'); // Başarılı bağlantı mesajı

    // MongoDB'ye başarıyla bağlandıktan sonra başka işlemler yapabilirsiniz
    // Örneğin bir test verisi ile veritabanı işlemi yapabilirsiniz.

    // Bağlantı başarılı ise çıkış yap
    process.exit(0); // Başarıyla çıkış yap
  } catch (err) {
    // Bağlantı hatası durumunda hata mesajı yazdır
    console.error('MongoDB connection error:', err.message);

    // Hata durumunda çıkış yap
    process.exit(1); // Hata ile çıkış yap
  }
};

// Bağlantıyı test etme fonksiyonunu çağırıyoruz
testConnection();