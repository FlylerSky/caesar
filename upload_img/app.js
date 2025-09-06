// Thay thế các giá trị này bằng thông tin của dự án Firebase của bạn
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Khởi tạo Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Thay thế bằng ID của thư mục IMG_TEST trên Google Drive của bạn
const FOLDER_ID = "11y3hrv57rau2IEywB3SEG2Pga7T93BJl"; 

// Lấy các element từ HTML
const signInBtn = document.getElementById('signInBtn');
const signOutBtn = document.getElementById('signOutBtn');
const authSection = document.getElementById('auth-section');
const userInfo = document.getElementById('userInfo');
const userNameElement = document.getElementById('userName');
const userPhotoElement = document.getElementById('userPhoto');
const uploadSection = document.getElementById('upload-section');
const fileInput = document.getElementById('fileInput');
const imageGallery = document.getElementById('image-gallery');
const loadingIndicator = document.getElementById('loading');

// Xử lý sự kiện khi trạng thái đăng nhập thay đổi
auth.onAuthStateChanged(user => {
    if (user) {
        // Người dùng đã đăng nhập
        userInfo.classList.remove('hidden');
        signInBtn.classList.add('hidden');
        uploadSection.classList.remove('hidden');
        
        userNameElement.textContent = user.displayName;
        userPhotoElement.src = user.photoURL;

        // Tải ảnh ngay sau khi đăng nhập thành công
        loadImages(); 
    } else {
        // Người dùng đã đăng xuất
        userInfo.classList.add('hidden');
        signInBtn.classList.remove('hidden');
        uploadSection.classList.add('hidden');
        imageGallery.innerHTML = '';
    }
});

// Xử lý sự kiện đăng nhập
signInBtn.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    // Thêm các quyền truy cập Google Drive cần thiết
    provider.addScope('https://www.googleapis.com/auth/drive.file'); 
    provider.addScope('https://www.googleapis.com/auth/drive.metadata.readonly'); 
    auth.signInWithPopup(provider).catch(error => {
        console.error("Lỗi đăng nhập:", error);
        alert("Đã có lỗi xảy ra khi đăng nhập.");
    });
});

// Xử lý sự kiện đăng xuất
signOutBtn.addEventListener('click', () => {
    auth.signOut().catch(error => {
        console.error("Lỗi đăng xuất:", error);
        alert("Đã có lỗi xảy ra khi đăng xuất.");
    });
});

// Xử lý tải file khi người dùng chọn file
fileInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (file) {
        try {
            loadingIndicator.classList.remove('hidden');
            await uploadFile(file);
            // Tải lại danh sách ảnh sau khi upload thành công
            await loadImages();
        } catch (error) {
            console.error("Lỗi khi tải ảnh lên:", error);
            alert("Không thể tải ảnh lên. Vui lòng thử lại.");
        } finally {
            loadingIndicator.classList.add('hidden');
            fileInput.value = ''; // Reset input để có thể chọn lại cùng 1 file
        }
    }
});

/**
 * Hàm tải file lên Google Drive
 * @param {File} file - File ảnh cần tải lên
 */
async function uploadFile(file) {
    if (!auth.currentUser) {
        alert("Vui lòng đăng nhập để tải ảnh lên.");
        return;
    }

    const accessToken = await auth.currentUser.getIdToken();

    const metadata = {
        'name': file.name,
        'parents': [FOLDER_ID],
        'mimeType': file.type
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);
    
    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
        body: form,
    });
    
    if (!response.ok) {
        throw new Error(`Tải lên thất bại: ${response.statusText}`);
    }
}

/**
 * Hàm lấy danh sách ảnh từ Google Drive và hiển thị
 */
async function loadImages() {
    imageGallery.innerHTML = '';
    loadingIndicator.classList.remove('hidden');

    try {
        if (!auth.currentUser) return;

        const accessToken = await auth.currentUser.getIdToken();
        
        // Truy vấn tất cả file ảnh trong thư mục
        const response = await fetch(`https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents+and+mimeType+contains+'image'`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(`Lấy danh sách file thất bại: ${response.statusText}`);
        }
        
        if (data.files && data.files.length > 0) {
            data.files.forEach(file => {
                const img = document.createElement('img');
                // Tạo đường dẫn để hiển thị ảnh trực tiếp từ Google Drive
                img.src = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&access_token=${accessToken}`;
                img.className = 'w-full h-48 object-cover rounded-lg shadow-md transition-transform duration-200 hover:scale-105 cursor-pointer';
                img.loading = 'lazy'; // Tối ưu hóa hiệu suất
                
                const container = document.createElement('div');
                container.className = 'relative group';
                container.appendChild(img);
                
                imageGallery.appendChild(container);
            });
        } else {
            imageGallery.innerHTML = '<p class="col-span-4 text-center text-gray-500">Chưa có ảnh nào trong thư mục này.</p>';
        }
    } catch (error) {
        console.error("Lỗi khi tải ảnh:", error);
        imageGallery.innerHTML = '<p class="col-span-4 text-center text-red-500">Có lỗi xảy ra khi tải ảnh. Vui lòng kiểm tra console log.</p>';
    } finally {
        loadingIndicator.classList.add('hidden');
    }
}