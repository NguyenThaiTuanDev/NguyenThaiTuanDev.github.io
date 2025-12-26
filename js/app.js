document.addEventListener('DOMContentLoaded', () => {
    // 1. SETUP GIAO DIỆN
    const userName = localStorage.getItem('nht_username') || 'Ứng viên';
    const jobPosition = localStorage.getItem('nht_job') || 'Phỏng vấn';

    // Set tiêu đề
    const jobTitleEl = document.getElementById('jobTitle');
    if (jobTitleEl) jobTitleEl.innerText = jobPosition + " Session";
    
    // Set Avatar US
    const avatarEl = document.getElementById('userAvatar');
    if (avatarEl) {
        avatarEl.src = `https://ui-avatars.com/api/?name=US&background=B936EE&color=fff&rounded=true&bold=true`;
    }

    startTimer();

    // AI Mở đầu (Sau 1 giây)
    setTimeout(() => {
        addMessage('ai', `Chào ${userName}. Tôi là AI Interviewer (Bản Demo).<br>Tôi sẽ phỏng vấn bạn cho vị trí <b>${jobPosition}</b>.<br><br>Lưu ý: <i>Đây là chế độ mô phỏng, tôi sẽ trả lời tự động mà không cần kết nối API thật.</i><br><br>Hãy bắt đầu: <b>Giới thiệu ngắn gọn về bản thân bạn?</b>`);
    }, 1000);

    // 2. XỬ LÝ SỰ KIỆN
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');

    if (sendBtn && userInput) {
        sendBtn.addEventListener('click', handleUserSubmit);
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleUserSubmit();
            }
        });
    }

    async function handleUserSubmit() {
        const text = userInput.value.trim();
        if (!text) return;

        // 1. Hiển thị tin nhắn User ngay lập tức
        addMessage('user', text);
        userInput.value = '';
        userInput.style.height = 'auto'; 

        // 2. Chạy hiệu ứng phân tích (Cột phải)
        analyzeResponse(text);

        // 3. Hiển thị trạng thái "AI đang nhập..."
        showTyping(true);

        // 4. Giả lập độ trễ mạng (1.5 giây) rồi mới trả lời
        setTimeout(async () => {
            const aiResponse = await getMockAIResponse(text);
            showTyping(false); // Tắt typing
            addMessage('ai', aiResponse); // Hiển thị tin nhắn AI
        }, 1500); 
    }
});

/* --- LOGIC PHỎNG VẤN MÔ PHỎNG (KHÔNG DÙNG API) --- */

const interviewTopics = [
    { name: "Giới thiệu", mainQuestion: "Giới thiệu bản thân." }, 
    { name: "Kinh nghiệm", mainQuestion: "Hãy chia sẻ về một dự án thành công nhất của bạn?" },
    { name: "Xử lý xung đột", mainQuestion: "Bạn sẽ làm gì nếu bất đồng quan điểm với sếp?" },
    { name: "Điểm yếu", mainQuestion: "Điểm yếu lớn nhất của bạn là gì?" },
    { name: "Kết thúc", mainQuestion: "Bạn có câu hỏi nào cho công ty không?" }
];

// Các câu "vặn vẹo" mẫu (Random để cho giống thật)
const followUpQuestions = [
    "Nghe có vẻ thú vị. Bạn có thể cho tôi một ví dụ cụ thể hơn về điều đó không?",
    "Tại sao bạn lại chọn cách giải quyết đó thay vì một phương án khác?",
    "Điều đó ảnh hưởng thế nào đến kết quả chung của nhóm?",
    "Nếu được làm lại, bạn sẽ thay đổi điều gì không?",
    "Chi tiết này khá quan trọng, bạn giải thích rõ hơn được không?"
];

// Các câu "ghi nhận" mẫu
const acknowledgePhrases = [
    "Tôi hiểu rồi.",
    "Ghi nhận câu trả lời của bạn.",
    "Khá hợp lý.",
    "Cảm ơn bạn đã chia sẻ.",
    "Được rồi."
];

let currentTopicIndex = 0; 
let isFollowUpPhase = true; 

// Hàm sinh câu trả lời giả (Mock)
async function getMockAIResponse(userText) {
    const currentTopic = interviewTopics[currentTopicIndex];

    // TRƯỜNG HỢP A: User vừa trả lời câu chính -> AI hỏi vặn vẹo (Follow-up)
    if (isFollowUpPhase) {
        isFollowUpPhase = false; // Lần sau sẽ chuyển chủ đề
        
        // Chọn random 1 câu hỏi vặn vẹo
        const randomQuestion = followUpQuestions[Math.floor(Math.random() * followUpQuestions.length)];
        return `<b>(Mô phỏng Phản biện):</b> ${randomQuestion}`;
    } 
    
    // TRƯỜNG HỢP B: User vừa trả lời câu vặn vẹo -> AI chuyển chủ đề
    else {
        currentTopicIndex++;
        
        if (currentTopicIndex < interviewTopics.length) {
            const nextTopic = interviewTopics[currentTopicIndex];
            const randomAck = acknowledgePhrases[Math.floor(Math.random() * acknowledgePhrases.length)];
            
            isFollowUpPhase = true; // Reset lại
            
            return `${randomAck} Chúng ta hãy chuyển sang chủ đề về <b>${nextTopic.name}</b>.<br><br>${nextTopic.mainQuestion}`;
        } else {
            return "Cảm ơn bạn đã tham gia buổi phỏng vấn mô phỏng. Tôi đã thu thập đủ thông tin. Kết quả sẽ được gửi sau. Chào bạn!";
        }
    }
}


/* --- CÁC HÀM HỖ TRỢ GIAO DIỆN (GIỮ NGUYÊN) --- */

function addMessage(role, htmlContent) {
    const chatWindow = document.getElementById('chatWindow');
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg ${role}`;
    
    const avatarIcon = role === 'ai' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
    
    msgDiv.innerHTML = `<div class="avatar">${avatarIcon}</div><div class="bubble">${htmlContent}</div>`;
    chatWindow.appendChild(msgDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function showTyping(show) {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.style.display = show ? 'flex' : 'none';
        const chatWindow = document.getElementById('chatWindow');
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
}

function analyzeResponse(text) {
    // Giả lập phân tích độ dài và từ khóa để thanh bên phải nhảy số cho đẹp
    const wordCount = text.split(/\s+/).length;
    const lengthBadge = document.getElementById('lengthBadge');
    const lengthStatus = document.getElementById('lengthStatus');
    const scoreEl = document.getElementById('keywordScore');
    const barEl = document.getElementById('keywordBar');
    
    if (scoreEl && barEl) {
        let currentScore = parseInt(scoreEl.innerText.split('/')[0]);
        // Cứ mỗi lần chat là tăng điểm giả vờ
        if (wordCount > 5 && currentScore < 5) {
            const newScore = Math.min(currentScore + 1, 5);
            scoreEl.innerText = `${newScore}/5`;
            barEl.style.width = `${(newScore/5)*100}%`;
        }
    }

    if (lengthBadge) {
        if (wordCount < 5) {
            lengthStatus.innerText = "Quá ngắn";
            lengthBadge.innerText = "Cảnh báo";
            lengthBadge.className = "status-badge badge-short";
        } else if (wordCount < 15) {
            lengthStatus.innerText = "Hơi ngắn";
            lengthBadge.innerText = "Cần thêm ý";
            lengthBadge.className = "status-badge badge-short";
        } else {
            lengthStatus.innerText = "Tốt";
            lengthBadge.innerText = "Đạt chuẩn";
            lengthBadge.className = "status-badge badge-good";
        }
    }
}

function startTimer() {
    let seconds = 0;
    const timerEl = document.getElementById('interviewTimer');
    if (timerEl) {
        setInterval(() => {
            seconds++;
            const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
            const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
            const s = (seconds % 60).toString().padStart(2, '0');
            timerEl.innerText = `${h}:${m}:${s}`;
        }, 1000);
    }
}