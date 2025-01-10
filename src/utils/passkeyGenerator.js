const crypto = require('crypto');

/**
 * Haftanın başlangıç tarihine dayalı bir şifre oluşturur.
 * @param {Date} weekStartDate - Haftanın başlangıç tarihi
 * @param {number} length - Şifrenin uzunluğu (varsayılan 8 karakter)
 * @returns {string} - Üretilen şifre
 */
const generatePasskey = (weekStartDate, length = 8) => {
  // weekStartDate bir Date nesnesi mi kontrol et
  if (!(weekStartDate instanceof Date) || isNaN(weekStartDate)) {
    throw new TypeError('weekStartDate geçerli bir Date nesnesi olmalı!');
  }

  const hash = crypto.createHash('sha256');
  hash.update(weekStartDate.toISOString()); // Tarihi ISO formatında güncelle
  return hash.digest('hex').substring(0, length); // Belirtilen uzunlukta şifre döndür
};

// Örnek test fonksiyonu
function testPasskeyGenerator() {
  const weekNumber = 9;
  const startDate = new Date('2024-11-11'); // Week 10 başlangıç tarihi

  // generatePasskey fonksiyonunu doğru şekilde çağır
  const passkey = generatePasskey(startDate); // sadece startDate'yi geç

  console.log(`Week ${weekNumber} için üretilen şifre:`, passkey);
}

// Test fonksiyonunu çağır
testPasskeyGenerator();

module.exports = { generatePasskey };

