const API_RESTAURANT = `${GATEWAY_URL}/api/v1/restaurants`;

let restaurants = [];
let currentEditingDishId = null;
let currentEditingRestaurantId = null;

// ==================== API REQUEST HELPER ====================
async function apiRequest(url, method = "GET", body = null) {
    const options = {
        method: method,
        headers: {
            "Content-Type": "application/json"
        }
    };
    
    if (body && method !== "GET") {
        options.body = JSON.stringify(body);
    }
    
    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `HTTP Error: ${response.status}`);
        }
        
        // DELETE trả về 204 No Content
        if (response.status === 204 || method === "DELETE") {
            return null;
        }
        
        return await response.json();
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
}

// ==================== KHỞI TẠO ====================
document.addEventListener("DOMContentLoaded", () => {
    loadRestaurants();
});

// ==================== TAB SWITCHING ====================
function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById(`tab-${tab}`).classList.add('active');
    event.target.classList.add('active');

    if(tab === 'menu') loadRestaurantOptions();
}

// ==================== RESTAURANT CRUD ====================

// 1. LOAD TẤT CẢ NHÀ HÀNG - GET /api/v1/restaurants
async function loadRestaurants() {
    const tbody = document.getElementById("resTableBody");
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center">⏳ Đang tải...</td></tr>`;
    
    try {
        const data = await apiRequest(API_RESTAURANT, "GET");
        restaurants = data || [];
        renderResTable(restaurants);
    } catch (e) {
        console.error(e);
        tbody.innerHTML = `<tr><td colspan="8" class="empty-state">❌ ${e.message}</td></tr>`;
    }
}

function renderResTable(data) {
    const tbody = document.getElementById("resTableBody");
    
    if(!data || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="empty-state">Chưa có dữ liệu.</td></tr>`;
        return;
    }
    
    tbody.innerHTML = data.map(r => `
        <tr>
            <td><strong>#${r.id}</strong></td>
            <td><strong>${r.name}</strong></td>
            <td>${r.description || '-'}</td>
            <td>${r.address}</td>
            <td>${r.phoneNumber}</td>
            <td>⭐ ${r.averageRating ? r.averageRating.toFixed(1) : '0.0'}</td>
            <td><span class="badge ${getStatusBadgeClass(r.status)}">${r.status || 'OPEN'}</span></td>
            <td>
                <button class="btn-edit" onclick="editRestaurant(${r.id})">✏️ Sửa</button>
                <button class="btn-delete" onclick="deleteRestaurant(${r.id})">🗑️ Xóa</button>
            </td>
        </tr>
    `).join("");
}

function getStatusBadgeClass(status) {
    if(status === 'OPEN') return 'badge-active';
    if(status === 'CLOSED') return 'badge-inactive';
    return 'badge-warning';
}

// 2. TÌM KIẾM NHÀ HÀNG (Client-side filter)
function searchRestaurant() {
    const keyword = document.getElementById("resSearch").value.toLowerCase().trim();
    
    if(!keyword) {
        renderResTable(restaurants);
        return;
    }
    
    const filtered = restaurants.filter(r => 
        r.name.toLowerCase().includes(keyword) || 
        r.address.toLowerCase().includes(keyword)
    );
    renderResTable(filtered);
}

function handleSearchKey(event) {
    if (event.key === "Enter") searchRestaurant();
}

// 3. THÊM NHÀ HÀNG - POST /api/v1/restaurants
document.getElementById("resForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    // Nếu đang edit thì gọi API update
    if(currentEditingRestaurantId) {
        await updateRestaurantSubmit();
        return;
    }
    
    const body = {
        ownerId: 1, // Demo - Thực tế lấy từ Auth Service/JWT
        name: document.getElementById("resName").value,
        description: document.getElementById("resDesc").value || null,
        address: document.getElementById("resAddr").value,
        phoneNumber: document.getElementById("resPhone").value
    };
    
    try {
        await apiRequest(API_RESTAURANT, "POST", body);
        alert("✅ Thêm nhà hàng thành công!");
        closeModal('resModal');
        document.getElementById("resForm").reset();
        loadRestaurants();
    } catch (e) {
        console.error(e);
        alert("❌ Lỗi: " + e.message); 
    }
});

// 4. SỬA NHÀ HÀNG - PUT /api/v1/restaurants/{id}
async function editRestaurant(id) {
    try {
        // Gọi API lấy chi tiết mới nhất
        const restaurant = await apiRequest(`${API_RESTAURANT}/${id}`, "GET");
        
        // Điền dữ liệu vào form
        document.getElementById("resName").value = restaurant.name;
        document.getElementById("resDesc").value = restaurant.description || '';
        document.getElementById("resAddr").value = restaurant.address;
        document.getElementById("resPhone").value = restaurant.phoneNumber;
        document.getElementById("resStatus").value = restaurant.status || 'OPEN';
        
        // Đổi tiêu đề modal và lưu ID đang edit
        document.querySelector('#resModal .modal-header h3').textContent = 'Sửa thông tin nhà hàng';
        currentEditingRestaurantId = id;
        
        openModal('resModal');
    } catch(e) {
        console.error(e);
        alert("❌ Lỗi tải chi tiết: " + e.message);
    }
}

async function updateRestaurantSubmit() {
    const body = {
        ownerId: 1, // Giữ nguyên ownerId
        name: document.getElementById("resName").value,
        description: document.getElementById("resDesc").value || null,
        address: document.getElementById("resAddr").value,
        phoneNumber: document.getElementById("resPhone").value
    };
    
    try {
        await apiRequest(`${API_RESTAURANT}/${currentEditingRestaurantId}`, "PUT", body);
        alert("✅ Cập nhật thành công!");
        closeModal('resModal');
        document.getElementById("resForm").reset();
        currentEditingRestaurantId = null;
        document.querySelector('#resModal .modal-header h3').textContent = 'Thêm Nhà Hàng Mới';
        loadRestaurants();
    } catch (e) {
        console.error(e);
        alert("❌ Lỗi: " + e.message); 
    }
}

// 5. XÓA NHÀ HÀNG - Backend chưa có endpoint này
function deleteRestaurant(id) {
    alert("⚠️ Backend chưa hỗ trợ xóa nhà hàng.\nCần thêm API: DELETE /api/v1/restaurants/{id}");
}

// ==================== DISH/MENU CRUD ====================

// 6. LOAD DANH SÁCH NHÀ HÀNG VÀO DROPDOWN
async function loadRestaurantOptions() {
    const select1 = document.getElementById("resFilter");
    const select2 = document.getElementById("dishResSelect");
    
    if(restaurants.length === 0) {
        try {
            restaurants = await apiRequest(API_RESTAURANT, "GET");
        } catch(e) {
            console.error(e);
            return;
        }
    }

    const opts = `<option value="">-- Chọn Nhà hàng --</option>` + 
                 restaurants.map(r => `<option value="${r.id}">${r.name}</option>`).join("");
    
    select1.innerHTML = opts;
    select2.innerHTML = opts;
}

// 7. LOAD MENU CỦA NHÀ HÀNG - GET /api/v1/restaurants/{restaurantId}/menu
async function loadDishes() {
    const resId = document.getElementById("resFilter").value;
    const tbody = document.getElementById("dishTableBody");
    
    if(!resId) {
        tbody.innerHTML = `<tr><td colspan="8" class="empty-state">👋 Vui lòng chọn nhà hàng để xem menu</td></tr>`;
        return;
    }

    tbody.innerHTML = `<tr><td colspan="8" class="loading-text">⏳ Đang tải...</td></tr>`;

    try {
        const data = await apiRequest(`${API_RESTAURANT}/${resId}/menu`, "GET");
        
        if(!data || data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="empty-state">Chưa có món ăn nào.</td></tr>`;
            return;
        }
        
        tbody.innerHTML = data.map(d => `
            <tr>
                <td><strong>#${d.id}</strong></td>
                <td><img src="${d.imageUrl || 'https://via.placeholder.com/50'}" class="menu-thumb" alt="${d.name}"></td>
                <td><strong>${d.name}</strong></td>
                <td>${d.description || '-'}</td>
                <td>${formatMoney(d.price)}</td>
                <td>${d.category || '-'}</td>
                <td>${d.isAvailable ? '<span class="badge badge-active">Còn hàng</span>' : '<span class="badge badge-inactive">Hết</span>'}</td>
                <td>
                    <button class="btn-edit" onclick="editDish(${d.id})">✏️ Sửa</button>
                    <button class="btn-delete" onclick="deleteDish(${d.id})">🗑️ Xóa</button>
                </td>
            </tr>
        `).join("");
    } catch (e) {
        console.error(e);
        tbody.innerHTML = `<tr><td colspan="8" class="empty-state">❌ Lỗi: ${e.message}</td></tr>`;
    }
}

// 8. THÊM MÓN ĂN - POST /api/v1/restaurants/{restaurantId}/dishes
document.getElementById("dishForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    // Nếu đang edit thì gọi API update
    if(currentEditingDishId) {
        await updateDishSubmit();
        return;
    }
    
    const resId = document.getElementById("dishResSelect").value;
    
    if(!resId) {
        alert("⚠️ Vui lòng chọn nhà hàng!");
        return;
    }

    const body = {
        name: document.getElementById("dishName").value,
        description: document.getElementById("dishDesc").value || null,
        category: document.getElementById("dishCategory").value || null,
        price: parseFloat(document.getElementById("dishPrice").value),
        imageUrl: document.getElementById("dishImg").value || null,
        isAvailable: document.getElementById("dishAvailable").value === "true"
    };

    try {
        await apiRequest(`${API_RESTAURANT}/${resId}/dishes`, "POST", body);
        alert("✅ Thêm món thành công!");
        closeModal('dishModal');
        document.getElementById("dishForm").reset();
        
        // Reload nếu đang xem menu của nhà hàng này
        if(document.getElementById("resFilter").value == resId) {
            loadDishes();
        }
    } catch (e) {
        console.error(e);
        alert("❌ Lỗi: " + e.message); 
    }
});

// 9. SỬA MÓN ĂN - PUT /api/v1/restaurants/dishes/{dishId}
async function editDish(dishId) {
    try {
        // Lấy chi tiết món ăn - GET /api/v1/restaurants/dishes/{dishId}
        const dish = await apiRequest(`${API_RESTAURANT}/dishes/${dishId}`, "GET");
        
        // Điền dữ liệu vào form
        document.getElementById("dishName").value = dish.name;
        document.getElementById("dishDesc").value = dish.description || '';
        document.getElementById("dishCategory").value = dish.category || '';
        document.getElementById("dishPrice").value = dish.price;
        document.getElementById("dishImg").value = dish.imageUrl || '';
        document.getElementById("dishAvailable").value = dish.isAvailable ? "true" : "false";
        
        // Ẩn dropdown chọn nhà hàng khi edit
        document.getElementById("dishResSelect").closest('.form-group').style.display = 'none';
        
        // Đổi tiêu đề modal
        document.querySelector('#dishModal .modal-header h3').textContent = 'Sửa thông tin món ăn';
        currentEditingDishId = dishId;
        
        openModal('dishModal');
    } catch(e) {
        console.error(e);
        alert("❌ Lỗi tải chi tiết: " + e.message);
    }
}

async function updateDishSubmit() {
    const body = {
        name: document.getElementById("dishName").value,
        description: document.getElementById("dishDesc").value || null,
        category: document.getElementById("dishCategory").value || null,
        price: parseFloat(document.getElementById("dishPrice").value),
        imageUrl: document.getElementById("dishImg").value || null,
        isAvailable: document.getElementById("dishAvailable").value === "true"
    };
    
    try {
        await apiRequest(`${API_RESTAURANT}/dishes/${currentEditingDishId}`, "PUT", body);
        alert("✅ Cập nhật món ăn thành công!");
        closeModal('dishModal');
        resetDishForm();
        loadDishes();
    } catch (e) {
        console.error(e);
        alert("❌ Lỗi: " + e.message); 
    }
}

// 10. XÓA MÓN ĂN - DELETE /api/v1/restaurants/dishes/{dishId}
async function deleteDish(dishId) {
    if(!confirm("❓ Bạn có chắc muốn xóa món này?")) return;
    
    try {
        await apiRequest(`${API_RESTAURANT}/dishes/${dishId}`, "DELETE");
        alert("✅ Xóa thành công!");
        loadDishes();
    } catch (e) {
        console.error(e);
        alert("❌ Lỗi xóa: " + e.message);
    }
}

// ==================== UTILITY FUNCTIONS ====================

function formatMoney(amount) {
    return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND' 
    }).format(amount);
}

function openModal(id) {
    document.getElementById(id).classList.add("active");
    document.getElementById("overlay").classList.add("active");
}

function closeModal(id) {
    document.getElementById(id).classList.remove("active");
    document.getElementById("overlay").classList.remove("active");
    
    // Reset form state khi đóng modal
    if(id === 'resModal') {
        currentEditingRestaurantId = null;
        document.getElementById("resForm").reset();
        document.querySelector('#resModal .modal-header h3').textContent = 'Thêm Nhà Hàng Mới';
    } else if(id === 'dishModal') {
        resetDishForm();
    }
}

function resetDishForm() {
    currentEditingDishId = null;
    document.getElementById("dishForm").reset();
    document.getElementById("dishResSelect").closest('.form-group').style.display = 'block';
    document.querySelector('#dishModal .modal-header h3').textContent = 'Thêm Món Ăn';
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    document.getElementById("overlay").classList.remove("active");
    currentEditingRestaurantId = null;
    resetDishForm();
}

// ==================== EXPORT TO GLOBAL ====================
window.switchTab = switchTab;
window.openModal = openModal;
window.closeModal = closeModal;
window.closeAllModals = closeAllModals;
window.loadDishes = loadDishes;
window.searchRestaurant = searchRestaurant;
window.handleSearchKey = handleSearchKey;
window.editRestaurant = editRestaurant;
window.deleteRestaurant = deleteRestaurant;
window.editDish = editDish;
window.deleteDish = deleteDish;