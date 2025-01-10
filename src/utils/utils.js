// Haftanın başlangıç ve bitiş tarihlerini hesaplayan fonksiyon
function getWeekStartEnd() {
    const currentDate = new Date();
    
    // Haftanın başlangıç (Pazartesi) tarihini bul
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0); // Saat kısmını sıfırla

    // Haftanın bitiş (Pazar) tarihini bul
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // 6 gün ekle
    endOfWeek.setHours(23, 59, 59, 999); // Son saati ayarla

    return { startOfWeek, endOfWeek };
}

module.exports = { getWeekStartEnd };
