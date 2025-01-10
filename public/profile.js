document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('authToken');
    
    // Kullanıcı giriş yapmamışsa yönlendirme yap
    if (!token) {
        alert('Please log in.');
        window.location.href = './Loginpage.html';
        return;
    }

    try {
        // Profil API çağrısı
        const response = await fetch('https://peaceful-forest-90255-fbe04ed90482.herokuapp.com/api/auth/profile', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`, // Bearer token düzgün bir şekilde yerleştirildi
            },
        });

        // Eğer response başarılı değilse, giriş yapılması gerektiği mesajı ve yönlendirme
        if (!response.ok) {
            alert('You need to log in.');
            window.location.href = './Loginpage.html';
            return;
        }

        // Kullanıcı bilgilerini al
        const user = await response.json();
        updateUserProfile(user); // Kullanıcı bilgileriyle UI'yi güncelle

    } catch (err) {
        console.error('Error:', err);
        alert('Profil yüklenirken bir hata oluştu.');
        window.location.href = './Loginpage.html';
    }

    // Çıkış Yap butonu için event listener
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('authToken'); // Giriş token'ı silinir
        window.location.href = './Loginpage.html'; // Giriş sayfasına yönlendirilir
    });
});

// Kullanıcı bilgileriyle UI'yi güncelleyen fonksiyon
function updateUserProfile(user) {
    const usernameElement = document.getElementById('username');
    const userroleElement = document.getElementById('userrole');
    const mainContent = document.getElementById('main-content');

    // Kullanıcı adı ve rolünü güncelle
    usernameElement.textContent = `${user.username} ${user.surname}`;
    userroleElement.textContent = user.role === 'student' ? 'Student' : 'Teacher';

    // Rol bazlı içerik oluştur
    if (user.role === 'student') {
        mainContent.innerHTML = `
            <section class="student">
                <div class="timeline-items">
                    <div class="timeline-item" onclick="window.location.href='./enterclass.html';">
                        <h3>Enter Class</h3>
                    </div>
                    <div class="timeline-item" onclick="window.location.href='./studentmylessons.html';">
                        <h3>See The Attendance Status</h3>
                    </div>
                    <div class="timeline-item" onclick="window.location.href='./courseschedule.html';">
                        <h3>Course Schedule</h3>
                    </div>
                </div>
            </section>
        `;
    } else if (user.role === 'teacher') {
        mainContent.innerHTML = `
            <section class="teacher">
                <div class="timeline-items">
                    <div class="timeline-item" onclick="window.location.href='./createpasskey.html';">
                        <h3>Create Passkey</h3>
                    </div>
                    <div class="timeline-item" onclick="window.location.href='./teachermylessons.html';">
                        <h3>See The Attendance List</h3>
                    </div>
                    <div class="timeline-item" onclick="window.location.href='./courseschedule.html';">
                        <h3>Course Schedule</h3>
                    </div>
                </div>
            </section>
        `;
    }
}