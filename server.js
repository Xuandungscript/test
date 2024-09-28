const WebSocket = require('ws');
const axios = require('axios');
const https = require('https');

const wss = new WebSocket.Server({ port: 8080 });

// Lưu trữ tên của các client đã kết nối
const clients = new Map();
let onlineCount = 0; // Biến để đếm số người dùng online

function saveMessageToDatabase(sender, message, user_id) {
    const agent = new https.Agent({  
        rejectUnauthorized: false
      });
      
      axios.post('https://localhost/public_html/chat', {
        sender: sender,
        message: message,
        user_id: user_id
      }, { httpsAgent: agent })
      .then(response => {
        console.log(response.data);
      })
      .catch(error => {
        console.error('Error saving message:', error);
      });
}

wss.on('connection', (ws) => {
    console.log('A new client connected!');
    onlineCount++; // Tăng số lượng người dùng online
    broadcastOnlineCount(); // Cập nhật số người dùng online cho tất cả các client

    ws.on('message', (data) => {
        const message = JSON.parse(data);

        // console.log('Received from client:', message);

        // Danh sách các từ ngữ tục tĩu
        const badWords = ['cút','iồn','đồn lâu', 'đặc cầu','cẹc', 'đuồi bầu','căng củ cọt','địt', 'chịch', 'lồn', 'cặc','lợn', 'đéo', 'vãi', 'buồi', 'đụ', 'đĩ', 'chó', 'mẹ', 'thằng', 'con', 'bố mày', 'mày', 'đm', 'dm', 'dcm', 'đm mày', 'mẹ mày', 'đồ', 'ngu', 'phò', 'phịch', 'làm tình', 'cu', 'lon', 'ngu', 'đĩ mẹ', 'đồ khốn', 'súc vật', 'buồi', 'buoi', 'dau buoi', 'daubuoi', 'caidaubuoi', 'nhucaidaubuoi', 'dau boi', 'bòi', 'dauboi', 'caidauboi', 'đầu bòy', 'đầu bùi', 'dau boy', 'dauboy', 'caidauboy', 'b`', 'cặc', 'cak', 'kak', 'kac', 'cac', 'concak', 'nungcak', 'bucak', 'caiconcac', 'caiconcak', 'cu', 'cặk', 'cak', 'dái', 'giái', 'zái', 'kiu', 'cứt', 'cuccut', 'cutcut', 'cứk', 'cuk', 'cười ỉa', 'cười ẻ', 'đéo', 'đếch', 'đếk', 'dek', 'đết', 'đệt', 'đách', 'dech', 'đ\'', 'deo', 'd\'', 'đel', 'đél', 'del', 'dell ngửi', 'dell ngui', 'dell chịu', 'dell chiu', 'dell hiểu', 'dell hieu', 'dellhieukieugi', 'dell nói', 'dell noi', 'dellnoinhieu', 'dell biết', 'dell biet', 'dell nghe', 'dell ăn', 'dell an', 'dell được', 'dell duoc', 'dell làm', 'dell lam', 'dell đi', 'dell di', 'dell chạy', 'dell chay', 'deohieukieugi', 'địt', 'đm', 'dm', 'đmm', 'dmm', 'đmmm', 'dmmm', 'đmmmm', 'dmmmm', 'đmmmmm', 'dmmmmm', 'đcm', 'dcm', 'đcmm', 'dcmm', 'đcmmm', 'dcmmm', 'đcmmmm', 'dcmmmm', 'đệch', 'đệt', 'dit', 'dis', 'diz', 'đjt', 'djt', 'địt mẹ', 'địt mịe', 'địt má', 'địt mía', 'địt ba', 'địt bà', 'địt cha', 'địt con', 'địt bố', 'địt cụ', 'dis me', 'disme', 'dismje', 'dismia', 'dis mia', 'dis mie', 'đis mịa', 'đis mịe', 'ditmemayconcho', 'ditmemay', 'ditmethangoccho', 'ditmeconcho', 'dmconcho', 'dmcs', 'ditmecondi', 'ditmecondicho', 'đụ', 'đụ mẹ', 'đụ mịa', 'đụ mịe', 'đụ má', 'đụ cha', 'đụ bà', 'đú cha', 'đú con mẹ', 'đú má', 'đú mẹ', 'đù cha', 'đù má', 'đù mẹ', 'đù mịe', 'đù mịa', 'đủ cha', 'đủ má', 'đủ mẹ', 'đủ mé', 'đủ mía', 'đủ mịa', 'đủ mịe', 'đủ mie', 'đủ mia', 'đìu', 'đờ mờ', 'đê mờ', 'đờ ma ma', 'đờ mama', 'đê mama', 'đề mama', 'đê ma ma', 'đề ma ma', 'dou', 'doma', 'duoma', 'dou má', 'duo má', 'dou ma', 'đou má', 'đìu má', 'á đù', 'á đìu', 'đậu mẹ', 'đậu má', 'đĩ', 'di~', 'đuỹ', 'điếm', 'cđĩ', 'cdi~', 'đilol', 'điloz', 'đilon', 'diloz', 'dilol', 'dilon', 'condi', 'condi~', 'dime', 'di me', 'dimemay', 'bím','condime', 'condimay', 'condimemay', 'con di cho', 'con di cho', 'condicho', 'bitch', 'biz', 'bít chi', 'con bích', 'con bic', 'con bíc', 'con bít', 'phò', '4`', 'lồn', 'l`', 'loz', 'lìn', 'nulo', 'ml', 'matlon', 'cailon', 'matlol', 'matloz', 'thml', 'thangmatlon', 'thangml', 'đỗn lì', 'tml', 'thml', 'diml', 'dml', 'hãm', 'xàm lol', 'xam lol', 'xạo lol', 'xao lol', 'con lol', 'ăn lol', 'an lol', 'mát lol', 'mat lol', 'cái lol', 'cai lol', 'lòi lol', 'loi lol', 'ham lol', 'củ lol', 'cu lol', 'ngu lol', 'tuổi lol', 'tuoi lol', 'mõm lol', 'mồm lol', 'mom lol', 'như lol', 'nhu lol', 'nứng lol', 'nung lol', 'nug lol', 'nuglol', 'rảnh lol', 'ranh lol', 'đách lol', 'dach lol', 'mu lol', 'banh lol', 'tét lol', 'tet lol', 'vạch lol', 'vach lol', 'cào lol', 'cao lol', 'tung lol', 'mặt lol', 'mát lol', 'mat lol', 'xàm lon', 'xam lon', 'xạo lon', 'xao lon', 'con lon', 'ăn lon', 'an lon', 'mát lon', 'mat lon', 'cái lon', 'cai lon', 'lòi lon', 'loi lon', 'ham lon', 'củ lon', 'cu lon', 'ngu lon', 'tuổi lon', 'tuoi lon', 'mõm lon', 'mồm lon', 'mom lon', 'như lon', 'nhu lon', 'nứng lon', 'nung lon', 'nug lon', 'nuglon', 'rảnh lon', 'ranh lon', 'đách lon', 'dach lon', 'mu lon', 'banh lon', 'tét lon', 'tet lon', 'vạch lon', 'vach lon', 'cào lon', 'cao lon', 'tung lon', 'mặt lon', 'mát lon', 'mat lon', 'cái lờ', 'cl', 'clgt', 'cờ lờ gờ tờ', 'cái lề gì thốn', 'đốn cửa lòng', 'sml', 'sapmatlol', 'sapmatlon', 'sapmatloz', 'sấp mặt', 'sap mat', 'vlon', 'vloz', 'vlol', 'vailon', 'vai lon', 'vai lol', 'vailol', 'nốn lừng', 'vcl', 'vl', 'vleu', 'chịch', 'chich', 'vãi', 'v~', 'đụ', 'nứng', 'nug', 'đút đít', 'chổng mông', 'banh háng', 'xéo háng', 'xhct', 'xephinh', 'la liếm', 'đổ vỏ', 'xoạc', 'xoac', 'chich choac', 'húp sò', 'fuck', 'fck', 'đụ', 'bỏ bú', 'buscu', 'ngu', 'óc chó', 'occho', 'lao cho', 'láo chó', 'bố láo', 'chó má', 'cờ hó', 'sảng', 'thằng chó', 'thang cho', 'thang cho', 'chó điên', 'thằng điên', 'thang dien', 'đồ điên', 'sủa bậy', 'sủa tiếp', 'sủa đi', 'sủa càn', 'mẹ bà', 'mẹ cha mày', 'me cha may', 'mẹ cha anh', 'mẹ cha nhà anh', 'mẹ cha nhà mày', 'me cha nha may', 'mả cha mày', 'mả cha nhà mày', 'ma cha may', 'ma cha nha may', 'mả mẹ', 'mả cha', 'kệ mẹ', 'kệ mịe', 'kệ mịa', 'kệ mje', 'kệ mja', 'ke me', 'ke mie', 'ke mia', 'ke mja', 'ke mje', 'bỏ mẹ', 'bỏ mịa', 'bỏ mịe', 'bỏ mja', 'bỏ mje', 'bo me', 'bo mia', 'bo mie', 'bo mje', 'bo mja', 'chetme', 'chet me', 'chết mẹ', 'chết mịa', 'chết mja', 'chết mịe', 'chết mie', 'chet mia', 'chet mie', 'chet mja', 'chet mje', 'thấy mẹ', 'thấy mịe', 'thấy mịa', 'thay me', 'thay mie', 'thay mia', 'tổ cha', 'bà cha mày', 'cmn', 'cmnl', 'tiên sư nhà mày', 'tiên sư bố', 'tổ sư','fuck', 'shit', 'bitch', 'asshole', 'bastard', 'damn', 'cunt', 'dick', 'pussy', 'cock', 'fucker', 'motherfucker', 'slut', 'whore', 'fucking', 'bullshit', 'ass', 'bitching', 'crap', 'douche', 'goddamn', 'jerk', 'prick', 'twat'];

        if (message.type === 'chat') {
            const senderName = clients.get(ws);
            const chatMessage = `${message.text}`;
            const user_id = `${message.user_id}`;
            const user_name = `${message.user_name}`;
            const role = `${message.role}`;

            // Kiểm tra tin nhắn có chứa từ ngữ tục tĩu không
            const containsBadWord = badWords.some(word => chatMessage.includes(word));

            if (containsBadWord) {
                // Phản hồi lỗi về client nếu có từ ngữ tục tĩu
                ws.send(JSON.stringify({ type: 'error', errorMessage: 'Vui lòng nhắn tin cẩn thận.'}));
            } else {
                // Lưu nội dung tin nhắn vào CSDL...
                saveMessageToDatabase(senderName, chatMessage, user_id);

                // Gửi tin nhắn tới tất cả các client khác
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ type: 'chat', sender: senderName, message: chatMessage, user_id: user_id, user_name: user_name, role: role }));
                    }
                });
            }
        }
    });

    ws.on('close', () => {
        const name = clients.get(ws);
        onlineCount--; // Giảm số lượng người dùng online
        broadcastOnlineCount(); // Cập nhật số người dùng online cho tất cả các client

        if (name) {
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'serverMessage', message: `${name} has left the chat.` }));
                }
            });
            console.log(`${name} disconnected`);
            clients.delete(ws);
        }
    });
});

// Hàm để phát số lượng người dùng online cho tất cả các client
function broadcastOnlineCount() {
    const countMessage = JSON.stringify({ type: 'onlineCount', count: onlineCount });
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(countMessage);
        }
    });
}

console.log('WebSocket server is running on ws://localhost:8080');


// var http = require('http');
// var server = http.createServer(function(req, res) {
//     res.writeHead(200, {'Content-Type': 'text/plain'});
//     var message = 'It works!\n',
//         version = 'NodeJS ' + process.versions.node + '\n',
//         response = [message, version].join('\n');
//     res.end(response);
// });
// server.listen();
