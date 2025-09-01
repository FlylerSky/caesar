// Firebase configuration (Replace with your own)
const firebaseConfig = {
    apiKey: "AIzaSyA4ace9iq9tr66MbJiI81Cuq8ruu1SnfYg",
    authDomain: "onichat-35008.firebaseapp.com",
    databaseURL: "https://onichat-35008-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "onichat-35008",
    storageBucket: "onichat-35008.appspot.com",
    messagingSenderId: "712555244409",
    appId: "1:712555244409:web:6c1a4ac156be18593ddda8"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();
const messagesRef = database.ref('messages');

// Google Auth Provider
const provider = new firebase.auth.GoogleAuthProvider();

// DOM elements (common)
const htmlRoot = document.getElementById('html-root');
const menuButton = document.getElementById('menu-button');
const menu = document.getElementById('menu');
const tabBoxChat = document.getElementById('tab-boxchat');
const tabSettings = document.getElementById('tab-settings');
const boxChatContent = document.getElementById('boxchat-content');
const settingsContent = document.getElementById('settings-content');
const connectionStatus = document.getElementById('connection-status');
const userStatus = document.getElementById('user-status');
const userName = document.getElementById('user-name');
const authButton = document.getElementById('auth-button');
const themeToggle = document.getElementById('theme-toggle');
const inputArea = document.getElementById('input-area');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const bgColorInput = document.getElementById('bg-color');
const navBgInput = document.getElementById('nav-bg');
const messageBgInput = document.getElementById('message-bg');
const inputBgInput = document.getElementById('input-bg');
const fontSizeSelect = document.getElementById('font-size');
const profileButton = document.getElementById('profile-button');
const boxChatList = document.getElementById('box-chat-list');
const privateChatModal = document.getElementById('private-chat-modal');
const privateChatClose = document.getElementById('private-chat-close');
const privateChatUser = document.getElementById('private-chat-user');
const privateMessagesDiv = document.getElementById('private-messages');
const privateMessageInput = document.getElementById('private-message-input');
const privateSendButton = document.getElementById('private-send-button');

// Load saved customization
const savedTheme = localStorage.getItem('theme') || 'light';
htmlRoot.classList.remove('light', 'dark');
htmlRoot.classList.add(savedTheme);
themeToggle.textContent = savedTheme === 'light' ? 'Dark Mode' : 'Light Mode';

const savedCustomizations = JSON.parse(localStorage.getItem('customizations')) || {};
bgColorInput.value = savedCustomizations.bgColor || (savedTheme === 'light' ? '#f3f4f6' : '#1f2937');
navBgInput.value = savedCustomizations.navBg || (savedTheme === 'light' ? '#2563eb' : '#1e40af');
messageBgInput.value = savedCustomizations.messageBg || (savedTheme === 'light' ? '#ffffff' : '#374151');
inputBgInput.value = savedCustomizations.inputBg || (savedTheme === 'light' ? '#ffffff' : '#374151');
fontSizeSelect.value = savedCustomizations.fontSize || '1rem';

// Apply saved customizations
document.documentElement.style.setProperty('--bg-color', bgColorInput.value);
document.documentElement.style.setProperty('--nav-bg', navBgInput.value);
document.documentElement.style.setProperty('--message-bg', messageBgInput.value);
document.documentElement.style.setProperty('--input-bg', inputBgInput.value);
document.documentElement.style.setProperty('--message-font-size', fontSizeSelect.value);

// Save and apply color customizations
function saveCustomizations() {
    const customizations = {
        bgColor: bgColorInput.value,
        navBg: navBgInput.value,
        messageBg: messageBgInput.value,
        inputBg: inputBgInput.value,
        fontSize: fontSizeSelect.value
    };
    localStorage.setItem('customizations', JSON.stringify(customizations));
    document.documentElement.style.setProperty('--bg-color', bgColorInput.value);
    document.documentElement.style.setProperty('--nav-bg', navBgInput.value);
    document.documentElement.style.setProperty('--message-bg', messageBgInput.value);
    document.documentElement.style.setProperty('--input-bg', inputBgInput.value);
    document.documentElement.style.setProperty('--message-font-size', fontSizeSelect.value);
}

// Event listeners for customization
bgColorInput.addEventListener('input', saveCustomizations);
navBgInput.addEventListener('input', saveCustomizations);
messageBgInput.addEventListener('input', saveCustomizations);
inputBgInput.addEventListener('input', saveCustomizations);
fontSizeSelect.addEventListener('change', saveCustomizations);

// Dark mode toggle
themeToggle.addEventListener('click', () => {
    const newTheme = htmlRoot.classList.contains('light') ? 'dark' : 'light';
    htmlRoot.classList.remove('light', 'dark');
    htmlRoot.classList.add(newTheme);
    themeToggle.textContent = newTheme === 'light' ? 'Dark Mode' : 'Light Mode';
    localStorage.setItem('theme', newTheme);
    bgColorInput.value = newTheme === 'light' ? '#f3f4f6' : '#1f2937';
    navBgInput.value = newTheme === 'light' ? '#2563eb' : '#1e40af';
    messageBgInput.value = newTheme === 'light' ? '#ffffff' : '#374151';
    inputBgInput.value = newTheme === 'light' ? '#ffffff' : '#374151';
    saveCustomizations();
    menu.classList.add('hidden');
});

// Menu toggle for mobile
menuButton.addEventListener('click', () => {
    menu.classList.toggle('hidden');
});

// Close menu when clicking outside (mobile only)
document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !menuButton.contains(e.target) && window.innerWidth < 640) {
        menu.classList.add('hidden');
    }
});

// Tab switching
tabBoxChat.addEventListener('click', () => {
    tabBoxChat.classList.add('active');
    tabSettings.classList.remove('active');
    boxChatContent.classList.add('active');
    settingsContent.classList.remove('active');
});

tabSettings.addEventListener('click', () => {
    tabSettings.classList.add('active');
    tabBoxChat.classList.remove('active');
    settingsContent.classList.add('active');
    boxChatContent.classList.remove('active');
});

// Monitor Firebase connection status
database.ref('.info/connected').on('value', (snapshot) => {
    if (snapshot.val()) {
        connectionStatus.textContent = 'Connected';
        connectionStatus.classList.remove('text-red-300');
        connectionStatus.classList.add('text-green-300');
    } else {
        connectionStatus.textContent = 'Disconnected';
        connectionStatus.classList.remove('text-green-300');
        connectionStatus.classList.add('text-red-300');
    }
});

// Handle authentication state
auth.onAuthStateChanged((user) => {
    if (user) {
        userStatus.classList.remove('hidden');
        userName.textContent = user.displayName || 'Anonymous';
        authButton.textContent = 'Sign Out';
        inputArea.classList.remove('hidden');
        sendButton.disabled = false;
        profileButton.disabled = false;
        loadBoxChats(user.uid);
        const urlParams = new URLSearchParams(window.location.search);
        const chatWith = urlParams.get('chatWith');
        if (chatWith) {
            database.ref(`users/${chatWith}`).once('value').then((snapshot) => {
                const otherName = snapshot.val()?.displayName || 'Anonymous';
                const chatId = [user.uid, chatWith].sort().join('_');
                openPrivateChat(chatId, otherName);
            });
        }
    } else {
        userStatus.classList.add('hidden');
        authButton.textContent = 'Sign in with Google';
        inputArea.classList.add('hidden');
        sendButton.disabled = true;
        profileButton.disabled = true;
    }
    updateSendButton();
});

// Sign in/out button handler
authButton.addEventListener('click', () => {
    if (auth.currentUser) {
        auth.signOut().catch((error) => {
            console.error('Sign out error:', error);
            alert('Failed to sign out.');
        });
    } else {
        auth.signInWithPopup(provider).catch((error) => {
            console.error('Sign in error:', error);
            alert('Failed to sign in: ' + error.message);
        });
    }
    menu.classList.add('hidden');
});

// Handle sending messages (only if authenticated)
sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !sendButton.disabled) {
        sendMessage();
    }
});

function sendMessage() {
    const user = auth.currentUser;
    const message = messageInput.value.trim();

    if (!user || !message) {
        alert('Please sign in and enter a message.');
        return;
    }

    const timestamp = Date.now();
    messagesRef.push({
        uid: user.uid,
        name: user.displayName || 'Anonymous',
        message: message,
        timestamp: timestamp
    }).then(() => {
        messageInput.value = '';
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }).catch((error) => {
        console.error('Error sending message:', error);
        alert('Failed to send message. Please try again.');
    });
}

// Listen for new messages
messagesRef.orderByChild('timestamp').limitToLast(50).on('child_added', (snapshot) => {
    const data = snapshot.val();
    if (data && data.name && data.message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', 'p-3', 'rounded-lg', 'shadow', 'max-w-full', 'sm:max-w-2xl', 'bg-white', 'dark:bg-gray-800');
        messageElement.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex items-center space-x-2">
                    <img src="${data.avatar || (data.gender === 'male' ? 'https://onemdca.vercel.app/chat2/img/male.png' : 'https://onemdca.vercel.app/chat2/img/female.jpg')}" class="w-8 h-8 rounded-full">
                    <div>
                        <span class="font-bold text-blue-600 dark:text-blue-400 cursor-pointer user-name" data-uid="${sanitizeHTML(data.uid)}">${sanitizeHTML(data.name)}</span>:
                        <span class="message-text">${sanitizeHTML(data.message)}</span>
                    </div>
                </div>
                <span class="text-xs text-gray-500 dark:text-gray-400">${new Date(data.timestamp).toLocaleTimeString()}</span>
            </div>
        `;
        messagesDiv.appendChild(messageElement);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
});

// Click on user name to view profile
messagesDiv.addEventListener('click', (e) => {
    if (e.target.classList.contains('user-name')) {
        const uid = e.target.dataset.uid;
        window.location.href = `profile.html?uid=${uid}`;
    }
});

// Basic HTML sanitization to prevent XSS
function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Enable/disable send button based on input
function updateSendButton() {
    const message = messageInput.value.trim();
    sendButton.disabled = !message || !auth.currentUser || connectionStatus.textContent !== 'Connected';
}

messageInput.addEventListener('input', updateSendButton);

// Initialize button state
updateSendButton();

// Profile button handler
profileButton.addEventListener('click', () => {
    const user = auth.currentUser;
    if (user) {
        window.location.href = `profile.html?uid=${user.uid}`;
    }
});

// Load box chats
function loadBoxChats(uid) {
    const chatsRef = database.ref('chats');
    chatsRef.orderByChild('timestamp').on('value', (snapshot) => {
        boxChatList.innerHTML = '';
        snapshot.forEach((child) => {
            const chatId = child.key;
            if (chatId.includes(uid)) {
                const otherUid = chatId.replace(uid, '').replace('_', '');
                database.ref(`users/${otherUid}`).once('value').then((userSnapshot) => {
                    const otherName = userSnapshot.val()?.displayName || 'Anonymous';
                    const chatItem = document.createElement('div');
                    chatItem.classList.add('cursor-pointer', 'p-2', 'border', 'rounded', 'bg-white', 'dark:bg-gray-800');
                    chatItem.textContent = `Chat with ${otherName}`;
                    chatItem.addEventListener('click', () => {
                        openPrivateChat(chatId, otherName);
                    });
                    boxChatList.appendChild(chatItem);
                });
            }
        });
    });
}

// Open private chat
function openPrivateChat(chatId, otherName) {
    privateChatUser.textContent = otherName;
    privateChatModal.style.display = 'block';
    loadPrivateMessages(chatId);
    privateSendButton.dataset.chatId = chatId;
    menu.classList.add('hidden');
}

// Private chat modal handlers
privateChatClose.addEventListener('click', () => {
    privateChatModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === privateChatModal) {
        privateChatModal.style.display = 'none';
    }
});

// Load private messages
function loadPrivateMessages(chatId) {
    privateMessagesDiv.innerHTML = '';
    const privateMessagesRef = database.ref(`chats/${chatId}/messages`);
    privateMessagesRef.orderByChild('timestamp').on('child_added', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const messageElement = document.createElement('div');
            messageElement.classList.add('p-2', 'border-b', 'bg-white', 'dark:bg-gray-800');
            messageElement.innerHTML = `
                <div class="flex items-center space-x-2">
                    <img src="${data.avatar || (data.gender === 'male' ? 'https://onemdca.vercel.app/chat2/img/male.png' : 'https://onemdca.vercel.app/chat2/img/female.jpg')}" class="w-6 h-6 rounded-full">
                    <span class="font-bold">${sanitizeHTML(data.name)}:</span>
                    ${sanitizeHTML(data.message)}
                </div>
                <span class="text-xs text-gray-500">${new Date(data.timestamp).toLocaleTimeString()}</span>
            `;
            privateMessagesDiv.appendChild(messageElement);
            privateMessagesDiv.scrollTop = privateMessagesDiv.scrollHeight;
        }
    });
}

// Send private message
privateSendButton.addEventListener('click', sendPrivateMessage);
privateMessageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendPrivateMessage();
    }
});

function sendPrivateMessage() {
    const chatId = privateSendButton.dataset.chatId;
    const user = auth.currentUser;
    const message = privateMessageInput.value.trim();

    if (user && message) {
        const privateMessagesRef = database.ref(`chats/${chatId}/messages`);
        const timestamp = Date.now();
        database.ref(`users/${user.uid}`).once('value').then((snapshot) => {
            const userData = snapshot.val();
            privateMessagesRef.push({
                uid: user.uid,
                name: user.displayName || 'Anonymous',
                message: message,
                timestamp: timestamp,
                avatar: userData?.avatar,
                gender: userData?.gender
            }).then(() => {
                privateMessageInput.value = '';
                privateMessagesDiv.scrollTop = privateMessagesDiv.scrollHeight;
            }).catch((error) => {
                console.error('Error sending private message:', error);
                alert('Failed to send private message.');
            });
        });
    } else {
        alert('Please enter a message.');
    }
}