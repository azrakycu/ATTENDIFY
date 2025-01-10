document.addEventListener('DOMContentLoaded', () => {
    const menuIcon = document.querySelector("#menu-icon");
    const navbar = document.querySelector(".navbar");

    if (menuIcon && navbar) {
        menuIcon.addEventListener("click", () => {
            console.log("Menu clicked"); // Bu satır menüye tıklanıp tıklanmadığını görmek için
            navbar.classList.toggle("active");
        });
    } else {
        console.error("Menu icon or navbar not found");
    }
});


const texts = [
    "attend your class", 
    "see attandance documents", 
    "see your schedule", 
    "see your lectures"
];

let index = 0;
let charIndex = 0;
let isDeleting = false;
const typingSpeed = 100;  // Yazma hızı
const deletingSpeed = 50; // Silme hızı
const pauseBetweenWords = 2000; // Kelimeler arası duraklama

function type() {
    const spanElement = document.getElementById('animated-text');
    const currentText = texts[index];

    if (isDeleting) {
        // Silme işlemi
        spanElement.textContent = currentText.substring(0, charIndex - 1);
        charIndex--;
    } else {
        // Yazma işlemi
        spanElement.textContent = currentText.substring(0, charIndex + 1);
        charIndex++;
    }

    if (!isDeleting && charIndex === currentText.length) {
        // Metnin tamamı yazıldığında bekle
        setTimeout(() => {
            isDeleting = true;
        }, pauseBetweenWords);
    } else if (isDeleting && charIndex === 0) {
        // Metin tamamen silindiğinde bir sonraki metne geç
        isDeleting = false;
        index = (index + 1) % texts.length;
    }

    // Hız ayarlaması (yazarken veya silerken farklı hız)
    const speed = isDeleting ? deletingSpeed : typingSpeed;
    setTimeout(type, speed);
}

// Yazma işlemini başlat
type();

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('authToken');
    
    // Kullanıcı giriş yapmamışsa yönlendirme yap
    if (!token) {
       
        document.getElementById('passkey-btn').addEventListener('click', (event) => {
            event.preventDefault();  // Buton tıklamasını engelle
            alert('You need to login.');
        });
        return;
    }

    try {
        // Profil API çağrısı
        const response = await fetch('https://peaceful-forest-90255-fbe04ed90482.herokuapp.com/api/auth/profile', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

       
        // Kullanıcı bilgilerini al
        const user = await response.json();

        // Kullanıcı rolüne göre Passkey butonunu kontrol et
        handlePasskeyButton(user);

    } catch (err) {
        console.error('Error:', err);
        alert('Profil yüklenirken bir hata oluştu.');
        window.location.href = './Loginpage.html';
    }
});

// Kullanıcı rolüne göre Passkey butonunu kontrol etme fonksiyonu
function handlePasskeyButton(user) {
    const passkeyBtn = document.getElementById('passkey-btn');
    
    if (user.role === 'teacher') {
        // Eğer kullanıcı öğretmense, Passkey butonuna tıklanabilir
        passkeyBtn.addEventListener('click', () => {
            window.location.href = './createpasskey.html'; // Passkey sayfasına yönlendir
        });
    } else {
        // Eğer kullanıcı öğrenci ise, Passkey butonuna tıklanamaz
        passkeyBtn.addEventListener('click', (event) => {
            event.preventDefault(); // Buton tıklamasını engelle
            alert('Only teachers can create Passkeys.');
        });
    }   
}

document.getElementById('contactForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Formun sayfayı yenilemesini engelle

    const fullname = document.getElementById('fullname').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    const teachermails = document.getElementById('teachermails').value;

    const formData = {
        fullname,
        email,
        subject,
        message,
        teachermails
    };

    try {
        const response = await fetch('https://peaceful-forest-90255-fbe04ed90482.herokuapp.com/api/contactTeacherRoutes/send-teacher',  {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        const result = await response.json();
        if (response.ok) {
            alert(result.message); // Mesaj başarıyla gönderildiğinde kullanıcıyı bilgilendir
            document.getElementById('contactForm').reset();
        } else {
            alert(result.message); // Hata mesajı
        }
    } catch (error) {
        console.error('Mesaj gönderme hatası:', error);
        alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
});
