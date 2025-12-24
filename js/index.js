document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. HIỆU ỨNG HEADER SCROLL (Sticky Header) ---
    const header = document.querySelector(".header");
    
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    });

    // --- 2. MOBILE MENU TOGGLE ---
    const menuToggle = document.querySelector(".menu-toggle");
    const navbar = document.querySelector(".navbar");

    if (menuToggle) {
        menuToggle.addEventListener("click", () => {
            navbar.classList.toggle("active");
            
            // Đổi icon hamburger thành icon X (optional)
            const icon = menuToggle.querySelector("i");
            if (navbar.classList.contains("active")) {
                icon.classList.remove("fa-bars");
                icon.classList.add("fa-times");
            } else {
                icon.classList.remove("fa-times");
                icon.classList.add("fa-bars");
            }
        });
    }

    // --- 3. SMOOTH SCROLL FOR ANCHOR LINKS ---
    // Khi bấm vào link trên menu, trang sẽ cuộn mượt xuống section đó
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            
            if (targetId === "#") return; // Bỏ qua link "#"

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Đóng menu mobile nếu đang mở
                if (navbar.classList.contains("active")) {
                    navbar.classList.remove("active");
                    const icon = menuToggle.querySelector("i");
                    icon.classList.remove("fa-times");
                    icon.classList.add("fa-bars");
                }

                // Tính toán vị trí trừ đi chiều cao header
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // --- 4. ANIMATION ON SCROLL (Fade In) ---
    // Hiệu ứng hiện dần khi cuộn xuống
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
                observer.unobserve(entry.target); // Chỉ chạy 1 lần
            }
        });
    }, observerOptions);

    // Áp dụng cho các thẻ card và section title
    const animatedElements = document.querySelectorAll('.feature-card, .step-item, .price-card, .section-title');
    
    animatedElements.forEach(el => {
        el.style.opacity = "0";
        el.style.transform = "translateY(30px)";
        el.style.transition = "all 0.6s ease-out";
        observer.observe(el);
    });

    // --- 5. LOGIC CLONE LOGO CHO MARQUEE (Tự động lặp) ---
    const marqueeTrack = document.querySelector(".partner-logos-track");
    if (marqueeTrack) {
        // Clone nội dung để chạy vô tận
        const logos = marqueeTrack.innerHTML;
        marqueeTrack.innerHTML += logos; // Nhân đôi danh sách logo
    }

});