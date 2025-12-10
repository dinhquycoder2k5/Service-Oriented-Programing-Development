// js/main.js

// State quản lý giỏ hàng
let cart = JSON.parse(localStorage.getItem("foodhub_cart")) || [];
let allDishes = [];

// --- 1. KHỞI TẠO ---
document.addEventListener("DOMContentLoaded", async () => {
    // Gọi hàm checkAuth từ js/auth.js để cập nhật Header (Hiển thị tên user)
    if (window.checkAuth) {
        window.checkAuth();
    }
    // checkAuthStatus(); // Kiểm tra đã đăng nhập chưa
    updateCartUI();    // Hiển thị giỏ hàng
    await loadMenu();  // Gọi API tải món ăn
});

// --- 2. KẾT NỐI BACKEND (Restaurant Service) ---
async function loadMenu() {
    const grid = document.getElementById("menuGrid");
    
    try {
        // GỌI API GATEWAY: Lấy danh sách nhà hàng
        const restaurants = await apiRequest(API.RESTAURANT);
        
        allDishes = [];
        // Duyệt từng nhà hàng để lấy menu
        for (const res of restaurants) {
            try {
                const menu = await apiRequest(`${API.RESTAURANT}/${res.id}/menu`);
                // Gắn thêm tên nhà hàng vào từng món
                const dishesWithInfo = menu.map(d => ({
                    ...d,
                    restaurantId: res.id,
                    restaurantName: res.name
                }));
                allDishes = allDishes.concat(dishesWithInfo);
            } catch (err) {
                console.warn(`Lỗi tải menu nhà hàng ${res.id}`);
            }
        }

        renderMenu(allDishes);

    } catch (error) {
        console.error(error);
        if(grid) {
            grid.innerHTML = `<div style="text-align:center; grid-column:1/-1; color:red;">
                <h3>⚠️ Lỗi kết nối</h3>
                <p>Không thể tải dữ liệu từ Gateway (8080).<br>${error.message}</p>
            </div>`;
        }
    }
}

function renderMenu(dishes) {
    const grid = document.getElementById("menuGrid");
    if (!grid) return; // Tránh lỗi nếu không ở trang chủ

    if (dishes.length === 0) {
        grid.innerHTML = `<p style="text-align:center; grid-column:1/-1;">Chưa có món ăn nào.</p>`;
        return;
    }

    grid.innerHTML = dishes.map(item => `
        <div class="menu-card">
            <img src="${item.imageUrl || 'https://via.placeholder.com/300x200?text=Food'}" alt="${item.name}">
            <div class="menu-card-content">
                <div class="menu-card-header">
                    <h3 class="menu-card-title">${item.name}</h3>
                    <span class="menu-card-price">${formatMoney(item.price)}</span>
                </div>
                <div class="menu-card-restaurant">🏪 ${item.restaurantName}</div>
                <p class="menu-card-desc">${item.description || 'Món ngon hấp dẫn'}</p>
                
                <button class="add-to-cart" onclick='addToCart(${JSON.stringify(item)})'>
                    + Thêm vào giỏ
                </button>
            </div>
        </div>
    `).join("");
}

// --- 3. XỬ LÝ GIỎ HÀNG ---
function addToCart(dish) {
    // Kiểm tra xem món mới có cùng nhà hàng với món trong giỏ không
    if (cart.length > 0 && cart[0].restaurantId !== dish.restaurantId) {
        if(!confirm("Giỏ hàng chỉ được chứa món của 1 nhà hàng. Bạn có muốn xóa giỏ hàng cũ để thêm món mới?")) {
            return;
        }
        cart = []; // Reset giỏ nếu khác nhà hàng
    }

    const existing = cart.find(i => i.id === dish.id);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ ...dish, quantity: 1 });
    }
    
    saveCart();
    // Hiệu ứng mở giỏ hàng
    document.getElementById("cartSidebar").classList.add("active");
    document.getElementById("overlay").classList.add("active");
}

function updateCartUI() {
    const countEl = document.getElementById("cartCount");
    const itemsEl = document.getElementById("cartItems");
    const totalEl = document.getElementById("cartTotal");

    if(!countEl || !itemsEl || !totalEl) return;

    // Update badge số lượng
    const totalQty = cart.reduce((sum, i) => sum + i.quantity, 0);
    countEl.innerText = totalQty;

    if (cart.length === 0) {
        itemsEl.innerHTML = `<div class="empty-cart"><p>Giỏ hàng trống</p></div>`;
        totalEl.innerText = "0 ₫";
        return;
    }

    // Tính tổng tiền
    let total = 0;
    itemsEl.innerHTML = cart.map((item, index) => {
        total += item.price * item.quantity;
        return `
            <div class="cart-item">
                <img src="${item.imageUrl || 'https://via.placeholder.com/60'}" alt="${item.name}">
                <div class="cart-info" style="flex:1">
                    <h4>${item.name}</h4>
                    <p>${formatMoney(item.price)}</p>
                    <div class="qty-control">
                        <button class="qty-btn" onclick="updateItemQty(${index}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" onclick="updateItemQty(${index}, 1)">+</button>
                    </div>
                </div>
                <button class="remove-btn" onclick="updateItemQty(${index}, -999)">Xóa</button>
            </div>
        `;
    }).join("");

    totalEl.innerText = formatMoney(total);
}

function updateItemQty(index, delta) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    saveCart();
}

function saveCart() {
    localStorage.setItem("foodhub_cart", JSON.stringify(cart));
    updateCartUI();
}

function toggleCart() {
    document.getElementById("cartSidebar").classList.toggle("active");
    document.getElementById("overlay").classList.toggle("active");
}

function closePanels() {
    document.getElementById("cartSidebar").classList.remove("active");
    document.getElementById("overlay").classList.remove("active");
}

// --- 4. AUTHENTICATION ---
function handleAuthClick() {
    const user = JSON.parse(localStorage.getItem("foodhub_auth"));
    if (!user) {
        window.location.href = "auth/login.html";
    }
}

// --- 5. CHECKOUT (Đặt hàng & Thanh toán) ---
async function checkout() {
    const user = JSON.parse(localStorage.getItem("foodhub_auth"));
    
    // 1. Validate Login
    if (!user) {
        alert("Vui lòng đăng nhập để đặt hàng!");
        window.location.href = "auth/login.html";
        return;
    }

    // 2. Validate Giỏ hàng
    if (cart.length === 0) return;

    // 3. Nhập địa chỉ (Demo dùng prompt, thực tế nên là form)
    const address = prompt("Nhập địa chỉ giao hàng của bạn:", "Hà Nội");
    if (!address) return;

    // 4. Chuẩn bị dữ liệu gửi Backend
    const restaurantId = cart[0].restaurantId;
    const orderReq = {
        userId: user.userId,
        restaurantId: restaurantId,
        deliveryAddress: address,
        items: cart.map(i => ({ dishId: i.id, quantity: i.quantity }))
    };

    try {
        // B1: Gọi Order Service tạo đơn
        const order = await apiRequest(API.ORDER, "POST", orderReq);
        console.log("Đơn hàng đã tạo:", order);

        // B2: Gọi Payment Service lấy link VNPAY
        // Lưu ý: apiRequest trả về Object JSON
        // B2: Gọi Payment Service lấy link VNPAY
        const paymentRes = await apiRequest(`${API.PAYMENT}/create?orderId=${order.id}&amount=${order.totalAmount}`, "POST");
        
        console.log("Payment Response Full:", paymentRes); 

        // --- SỬA LOGIC LẤY LINK (Hỗ trợ nhiều tên biến) ---
        // Thử tìm link trong các tên biến phổ biến: .url, .paymentUrl, .vnpUrl, hoặc .data
        const linkThanhToan = paymentRes.url || paymentRes.paymentUrl || paymentRes.vnpUrl || paymentRes.data;

        if (linkThanhToan) { 
            // Clear giỏ hàng
            cart = []; saveCart();
            // Chuyển hướng sang VNPAY
            window.location.href = linkThanhToan; 
        } else {
            // Nếu vẫn không tìm thấy, in ra popup để bạn biết tên biến là gì
            alert("Lỗi: Không tìm thấy link! Backend trả về: " + JSON.stringify(paymentRes));
            console.error("Dữ liệu nhận được:", paymentRes);
        }

    } catch (err) {
        console.error(err);
        alert("Đặt hàng thất bại: " + err.message);
    }
}

// --- LOGIC HIỂN THỊ MENU TÀI KHOẢN ---
function checkLoginStatus() {
    const authBtn = document.getElementById("authBtn");
    // Nếu không có nút authBtn (ở trang khác) thì return để tránh lỗi
    if (!authBtn) return; 

    const authData = JSON.parse(localStorage.getItem("foodhub_auth"));

    if (authData && authData.email) {
        // 1. Nếu ĐÃ ĐĂNG NHẬP
        authBtn.innerHTML = `
            <div class="user-dropdown" id="userDropdownContainer">
                <span onclick="toggleDropdown(event)" style="cursor: pointer; font-weight: bold;">
                    👤 ${authData.email} ▾
                </span>
                <div id="myDropdown" class="dropdown-content">
                    <a href="customer/profile.html">📝 Thông tin khách hàng</a>
                    <a href="#" onclick="handleLogout(event)">🚪 Đăng xuất</a>
                </div>
            </div>
        `;
        authBtn.classList.remove("login-btn");
        authBtn.removeAttribute("onclick"); 
        
    } else {
        // 2. Nếu CHƯA ĐĂNG NHẬP
        authBtn.innerHTML = "🔐 Đăng nhập";
        authBtn.classList.add("login-btn");
        authBtn.setAttribute("onclick", "handleAuthClick()");
    }
}

// Hàm bật/tắt menu khi nhấn vào tên
function toggleDropdown(event) {
    event.stopPropagation();
    const dropdown = document.getElementById("myDropdown");
    if(dropdown) dropdown.classList.toggle("show-dropdown");
}

// Hàm xử lý Đăng xuất
function handleLogout(event) {
    event.preventDefault();
    localStorage.removeItem("foodhub_auth");
    alert("Đăng xuất thành công!");
    window.location.href = "index.html"; 
}

// Đóng menu khi click ra ngoài
window.onclick = function(event) {
    if (!event.target.matches('.user-dropdown span')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show-dropdown')) {
                openDropdown.classList.remove('show-dropdown');
            }
        }
    }
}

// --- BỔ SUNG HÀM KIỂM TRA ĐĂNG NHẬP ---
function checkLoginAndRedirect(targetUrl) {
    const authData = JSON.parse(localStorage.getItem("foodhub_auth"));
    if (authData && authData.token) {
        window.location.href = targetUrl;
    } else {
        alert("Vui lòng đăng nhập để xem đơn hàng của bạn!");
        window.location.href = "auth/login.html";
    }
}

window.checkLoginAndRedirect = checkLoginAndRedirect;
document.addEventListener("DOMContentLoaded", checkLoginStatus);