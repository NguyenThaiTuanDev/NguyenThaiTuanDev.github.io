// --- CẤU HÌNH API GEMINI ---
const GEMINI_API_KEY = ''; // <--- DÁN KEY CỦA BẠN VÀO ĐÂY
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

document.addEventListener('DOMContentLoaded', () => {
    // 1. SETUP GIAO DIỆN
    const userName = localStorage.getItem('nht_username') || 'Ứng viên';
    const jobPosition = localStorage.getItem('nht_job') || 'Phỏng vấn';

    document.getElementById('jobTitle').innerText = jobPosition + " Session";
    document.getElementById('userAvatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=48CAE4&color=000`;

    startTimer();

    // AI Mở đầu (Câu hỏi đầu tiên luôn cố định để bắt đầu nhanh)
    setTimeout(() => {
        addMessage('ai', `Chào ${userName}. Tôi là AI Interviewer.<br>Tôi sẽ phỏng vấn bạn cho vị trí <b>${jobPosition}</b>.<br><br>Tôi sẽ lắng nghe và đưa ra các câu hỏi phản biện ngay sau câu trả lời của bạn.<br><br>Hãy bắt đầu: <b>Giới thiệu ngắn gọn về bản thân bạn?</b>`);
    }, 1000);

    // 2. XỬ LÝ SỰ KIỆN
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');

    sendBtn.addEventListener('click', handleUserSubmit);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleUserSubmit();
        }
    });

    async function handleUserSubmit() {
        const text = userInput.value.trim();
        if (!text) return;

        // User hiển thị tin nhắn
        addMessage('user', text);
        userInput.value = '';
        userInput.style.height = 'auto';

        // Phân tích hiển thị (Cột phải - Giả lập)
        analyzeResponse(text);

        // AI Suy nghĩ & Gọi API
        showTyping(true);

        try {
            // Gọi hàm xử lý logic phỏng vấn với Gemini
            const aiResponse = await processInterviewWithGemini(text, jobPosition);
            
            showTyping(false);
            addMessage('ai', aiResponse);
        } catch (error) {
            console.error(error);
            showTyping(false);
            addMessage('ai', "Hệ thống đang quá tải hoặc lỗi kết nối. Vui lòng thử lại sau giây lát.");
        }
    }
});

/* --- LOGIC PHỎNG VẤN TÍCH HỢP GEMINI --- */

// Danh sách các chủ đề (Chỉ cần tên chủ đề và câu hỏi chính, câu phản biện sẽ do AI tự nghĩ)
const interviewTopics = [
    { name: "Giới thiệu bản thân", mainQuestion: "Hãy giới thiệu về bản thân bạn." }, // Index 0 (Đã hỏi ở intro)
    { name: "Kinh nghiệm làm việc", mainQuestion: "Hãy chia sẻ về một dự án hoặc thành tựu mà bạn tự hào nhất?" },
    { name: "Điểm yếu", mainQuestion: "Đâu là điểm yếu lớn nhất của bạn và nó ảnh hưởng thế nào đến công việc?" },
    { name: "Mức lương", mainQuestion: "Mức lương kỳ vọng của bạn là bao nhiêu và tại sao?" }
];

// Trạng thái
let currentTopicIndex = 0; 
let isFollowUpPhase = true; // True: Đang đợi AI vặn vẹo. False: Đang đợi chuyển câu hỏi mới.

async function processInterviewWithGemini(userText, jobPosition) {
    const wordCount = userText.split(/\s+/).length;

    // 1. Kiểm tra đầu vào cơ bản (Client side check)
    if (wordCount < 3) {
        return "Câu trả lời quá ngắn. Vui lòng trả lời chi tiết và nghiêm túc hơn.";
    }

    // 2. Xây dựng Prompt (Kịch bản) gửi cho Gemini
    let prompt = "";
    const currentTopic = interviewTopics[currentTopicIndex];

    // --- TRƯỜNG HỢP A: User vừa trả lời câu chính -> AI cần PHẢN BIỆN (Vặn vẹo) ---
    if (isFollowUpPhase) {
        prompt = `
            Bạn là một nhà tuyển dụng khó tính và sắc sảo đang phỏng vấn ứng viên cho vị trí "${jobPosition}".
            
            Chủ đề hiện tại: "${currentTopic.name}".
            Câu hỏi bạn vừa hỏi: "${currentTopic.mainQuestion}".
            Câu trả lời của ứng viên: "${userText}".

            Nhiệm vụ của bạn:
            1. Tìm ra một lỗ hổng logic, sự thiếu sót, hoặc điểm nghi vấn trong câu trả lời trên.
            2. Đặt một câu hỏi phản biện (Follow-up question) ngắn gọn, sắc bén để thử thách ứng viên.
            3. Giọng điệu: Chuyên nghiệp nhưng nghiêm khắc, nghi ngờ.
            4. Trả lời bằng Tiếng Việt. Không cần chào hỏi, đi thẳng vào câu hỏi.
        `;
        
        // Đổi trạng thái: Lần sau sẽ là chuyển chủ đề
        isFollowUpPhase = false;
    } 
    // --- TRƯỜNG HỢP B: User vừa trả lời câu phản biện -> AI Gật đầu & CHUYỂN CHỦ ĐỀ ---
    else {
        // Tăng index để lấy chủ đề tiếp theo
        currentTopicIndex++;
        
        if (currentTopicIndex < interviewTopics.length) {
            const nextTopic = interviewTopics[currentTopicIndex];
            prompt = `
                Bạn là nhà tuyển dụng. Ứng viên vừa trả lời câu hỏi phản biện của bạn: "${userText}".
                
                Nhiệm vụ của bạn:
                1. Ghi nhận câu trả lời một cách ngắn gọn (Ví dụ: "Được rồi", "Tôi ghi nhận điều đó", "Khá hợp lý").
                2. Chuyển ngay sang chủ đề tiếp theo là: "${nextTopic.name}".
                3. Đặt câu hỏi chính cho chủ đề này: "${nextTopic.mainQuestion}".
                4. Trả lời bằng Tiếng Việt.
            `;
            // Đặt lại trạng thái để lần tới sẽ vặn vẹo tiếp
            isFollowUpPhase = true;
        } else {
            // Hết câu hỏi
            return "Cảm ơn bạn. Tôi đã khai thác đủ thông tin cần thiết qua các vòng câu hỏi. Kết quả đánh giá chi tiết và lộ trình cải thiện kỹ năng sẽ được gửi qua email cho bạn trong 24h tới. Chào bạn.";
        }
    }

    // 3. Gọi Gemini API
    const responseText = await callGemini(prompt);
    return responseText;
}

// Hàm gọi API thực tế
async function callGemini(promptText) {
    const payload = {
        contents: [{
            parts: [{ text: promptText }]
        }]
    };

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    // Parse kết quả từ Gemini
    if (data.candidates && data.candidates.length > 0) {
        return data.candidates[0].content.parts[0].text;
    } else {
        return "Xin lỗi, tôi chưa nghe rõ. Bạn có thể nói lại không?";
    }
}

// --- CÁC HÀM HỖ TRỢ GIAO DIỆN (GIỮ NGUYÊN) ---

function addMessage(role, htmlContent) {
    const chatWindow = document.getElementById('chatWindow');
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg ${role}`;
    const avatarIcon = role === 'ai' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
    // Xử lý xuống dòng cho đẹp nếu Gemini trả về văn bản dài
    const formattedContent = htmlContent.replace(/\n/g, '<br>');
    msgDiv.innerHTML = `<div class="avatar">${avatarIcon}</div><div class="bubble">${formattedContent}</div>`;
    chatWindow.appendChild(msgDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function showTyping(show) {
    document.getElementById('typingIndicator').style.display = show ? 'flex' : 'none';
    const chatWindow = document.getElementById('chatWindow');
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function analyzeResponse(text) {
    // Logic giả lập phân tích realtime (để làm màu cho giao diện)
    const wordCount = text.split(/\s+/).length;
    const lengthBadge = document.getElementById('lengthBadge');
    const lengthStatus = document.getElementById('lengthStatus');
    
    // Thanh keyword giả lập
    const currentScore = parseInt(document.getElementById('keywordScore').innerText.split('/')[0]);
    if (wordCount > 15 && currentScore < 5) {
        const newScore = currentScore + 1;
        document.getElementById('keywordScore').innerText = `${newScore}/5`;
        document.getElementById('keywordBar').style.width = `${(newScore/5)*100}%`;
    }

    if (wordCount < 10) {
        lengthStatus.innerText = "Hơi ngắn";
        lengthBadge.innerText = "Cần chi tiết";
        lengthBadge.className = "status-badge badge-short";
    } else {
        lengthStatus.innerText = "Tốt";
        lengthBadge.innerText = "Đạt";
        lengthBadge.className = "status-badge badge-good";
    }
}

function startTimer() {
    let seconds = 0;
    const timerEl = document.getElementById('interviewTimer');
    setInterval(() => {
        seconds++;
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        timerEl.innerText = `${h}:${m}:${s}`;
    }, 1000);
}