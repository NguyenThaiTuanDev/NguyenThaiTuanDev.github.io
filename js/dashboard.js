document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Load Avatar & User Name
    const userName = localStorage.getItem('nht_username') || 'User';
    const sideAvatar = document.getElementById('sideAvatar');
    const welcomeMsg = document.getElementById('welcomeMsg');

    if (sideAvatar) {
        sideAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=B936EE&color=fff`;
    }
    if (welcomeMsg) {
        welcomeMsg.innerHTML = `Chào ${userName},<br><span style="font-size:1rem; color:#A0A0B0; font-weight:400">Đây là tổng quan năng lực của bạn</span>`;
    }


    // 2. Cấu hình Biểu đồ (Radar Chart)
    const ctx = document.getElementById('skillChart');

    if (ctx) {
        new Chart(ctx, {
            type: 'radar', // Loại biểu đồ màng nhện
            data: {
                labels: ['Chuyên môn', 'Tiếng Anh', 'Tự tin', 'Tư duy', 'Thái độ', 'Xử lý'],
                datasets: [{
                    label: 'Điểm năng lực',
                    data: [8, 6.5, 9, 7.5, 8.5, 7], // Dữ liệu mẫu
                    
                    // Màu sắc theo theme Neon
                    backgroundColor: 'rgba(185, 54, 238, 0.2)', // Nền tím trong suốt
                    borderColor: '#B936EE', // Viền tím neon
                    borderWidth: 2,
                    
                    pointBackgroundColor: '#48CAE4', // Điểm tròn xanh neon
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#B936EE'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        // Màu lưới và đường kẻ
                        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        
                        // Màu chữ nhãn (Chuyên môn, Tiếng Anh...)
                        pointLabels: {
                            color: '#A0A0B0',
                            font: { family: "'Outfit', sans-serif", size: 12 }
                        },
                        // Ẩn số trên trục để đỡ rối
                        ticks: { display: false, max: 10, stepSize: 2 }
                    }
                },
                plugins: {
                    legend: { display: false } // Ẩn chú thích dataset
                }
            }
        });
    }

    // 3. Tự động Active Sidebar (Logic giống History)
    const currentPage = window.location.pathname.split("/").pop();
    const navLinks = document.querySelectorAll('.app-nav a');

    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});