/*************** DỮ LIỆU MÓN (chi tiết để hiện khi hover/chạm) ***************/
const menuItems = [
  { id: 1, name: 'Burger Bò Phô Mai', description: 'Burger bò Úc 100%, phô mai cheddar, rau xanh tươi', price: 89000, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop', category: 'burger', rating: 4.5,
    details: { calories: 540, prep: '15–20 phút', ingredients: ['Bò Úc','Phô mai cheddar','Xà lách','Cà chua','Sốt đặc biệt'], allergens: ['Sữa','Gluten'], spicy: 'Không cay' } },
  { id: 2, name: 'Pizza Hải Sản', description: 'Tôm, mực, sò điệp, phô mai mozzarella', price: 159000, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop', category: 'pizza', rating: 4.8,
    details: { calories: 720, prep: '20–25 phút', ingredients: ['Tôm','Mực','Sò điệp','Mozzarella','Sốt cà'], allergens: ['Hải sản','Sữa','Gluten'], spicy: 'Hơi cay' } },
  { id: 3, name: 'Sushi Cá Hồi', description: 'Cá hồi Na Uy tươi, cơm Nhật, rong biển', price: 129000, image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop', category: 'sushi', rating: 4.7,
    details: { calories: 380, prep: '10–15 phút', ingredients: ['Cá hồi','Cơm Nhật','Rong biển','Wasabi','Gừng hồng'], allergens: ['Cá'], spicy: 'Không cay' } },
  { id: 4, name: 'Phở Bò Đặc Biệt', description: 'Phở bò Hà Nội truyền thống, nước dùng đậm đà', price: 65000, image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400&h=300&fit=crop', category: 'noodles', rating: 4.6,
    details: { calories: 450, prep: '8–12 phút', ingredients: ['Bò tái','Bánh phở','Hành hoa','Quế hồi','Chanh ớt'], allergens: [], spicy: 'Tùy chọn' } },
  { id: 5, name: 'Trà Sữa Trân Châu', description: 'Trà sữa Đài Loan, trân châu đen dai ngon', price: 35000, image: 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=400&h=300&fit=crop', category: 'drink', rating: 4.4,
    details: { calories: 280, prep: '3–5 phút', ingredients: ['Trà đen','Sữa','Trân châu đen','Đường nâu'], allergens: ['Sữa'], spicy: 'Không cay' } },
  { id: 6, name: 'Bánh Tiramisu', description: 'Bánh Tiramisu Ý nguyên bản, kem mascarpone', price: 55000, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop', category: 'dessert', rating: 4.9,
    details: { calories: 420, prep: '5–7 phút', ingredients: ['Mascarpone','Cà phê','Ca cao','Bánh ladyfinger'], allergens: ['Sữa','Trứng','Gluten'], spicy: 'Không cay' } },
  { id: 7, name: 'Burger Gà Giòn', description: 'Gà giòn rụm, sốt mayonnaise, salad tươi', price: 75000, image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&h=300&fit=crop', category: 'burger', rating: 4.3,
    details: { calories: 510, prep: '12–18 phút', ingredients: ['Gà chiên giòn','Mayonnaise','Xà lách','Dưa leo'], allergens: ['Trứng','Gluten'], spicy: 'Tùy chọn' } },
  { id: 8, name: 'Pizza Pepperoni', description: 'Xúc xích pepperoni, phô mai mozzarella đặc biệt', price: 149000, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop', category: 'pizza', rating: 4.7,
    details: { calories: 680, prep: '18–22 phút', ingredients: ['Pepperoni','Mozzarella','Bột bánh','Sốt cà'], allergens: ['Sữa','Gluten'], spicy: 'Hơi cay' } },
];

let cart = [];
let orders = []; // {id, items, total, status, createdAt, rating?, review?}
let currentUser = null; // {email, name}

/*************** STORAGE (orders + user) ***************/
function loadOrders(){ try{ orders = JSON.parse(localStorage.getItem('foodhub_orders')||'[]'); }catch{ orders=[]; } }
function saveOrders(){ localStorage.setItem('foodhub_orders', JSON.stringify(orders)); }
function loadUser(){ try{ currentUser = JSON.parse(localStorage.getItem('foodhub_user')||'null'); }catch{ currentUser=null; } }
function saveUser(){ localStorage.setItem('foodhub_user', JSON.stringify(currentUser)); }

/*************** RENDER MENU (kèm overlay chi tiết) ***************/
function renderMenu(items = menuItems) {
  const menuGrid = document.getElementById('menuGrid');
  menuGrid.innerHTML = items.map(item => {
    const d = item.details || {};
    const ingredients = (d.ingredients || []).slice(0, 5).join(', ');
    const allergens = (d.allergens || []).join(', ') || '—';
    return `
      <div class="menu-card" data-id="${item.id}">
        <img src="${item.image}" alt="${item.name}">
        <div class="menu-card-content">
          <h3>${item.name}</h3>
          <p>${item.description}</p>
          <div class="menu-card-footer">
            <span class="price">${item.price.toLocaleString()}đ</span>
            <span class="rating">⭐ ${item.rating}</span>
          </div>
          <button class="add-to-cart" onclick="addToCart(${item.id})">Thêm vào giỏ</button>
        </div>

        <div class="hover-info">
          <button class="hover-close" type="button" aria-label="Đóng">Đóng</button>
          <div class="hover-title">Thông tin chi tiết</div>
          <div class="badges">
            ${d.calories ? `<span class="badge">🍽 ${d.calories} kcal</span>` : ''}
            ${d.prep ? `<span class="badge">⏱ ${d.prep}</span>` : ''}
            ${d.spicy ? `<span class="badge">🌶 ${d.spicy}</span>` : ''}
          </div>
          <div class="hover-meta">
            ${ingredients ? `<div><strong>Nguyên liệu:</strong> ${ingredients}</div>` : ''}
            <div><strong>Dị ứng:</strong> ${allergens}</div>
            <ul style="margin-top:6px;">
              <li>Đánh giá hiện tại: ${item.rating} ★</li>
              <li>Giá: ${item.price.toLocaleString()}đ</li>
            </ul>
          </div>
        </div>
      </div>
    `;
  }).join('');

  const isTouch = window.matchMedia('(hover: none)').matches;
  document.querySelectorAll('.menu-card').forEach(card => {
    const closeBtn = card.querySelector('.hover-close');
    closeBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      card.classList.remove('show');
      card.classList.add('no-hover');
      const onLeave = () => { card.classList.remove('no-hover'); card.removeEventListener('mouseleave', onLeave); };
      card.addEventListener('mouseleave', onLeave);
      setTimeout(() => { card.blur?.(); }, 150);
    });

    if (isTouch) {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.add-to-cart')) return;
        document.querySelectorAll('.menu-card.show').forEach(c => { if (c !== card) c.classList.remove('show'); });
        card.classList.toggle('show');
      });
    }
  });

  if (isTouch) {
    document.addEventListener('click', (e) => {
      const open = document.querySelector('.menu-card.show');
      if (open && !e.target.closest('.menu-card')) open.classList.remove('show');
    }, { passive: true });
  }
}

/*************** CART ***************/
function addToCart(itemId){
  const item = menuItems.find(i=>i.id===itemId);
  const existing = cart.find(i=>i.id===itemId);
  if (existing) existing.quantity++; else cart.push({...item, quantity:1});
  updateCart(); showNotification('Đã thêm vào giỏ hàng!');
}
function updateCart(){
  const cartItems = document.getElementById('cartItems');
  const cartCount = document.getElementById('cartCount');
  const cartTotal = document.getElementById('cartTotal');

  cartCount.textContent = cart.reduce((s,i)=>s+i.quantity,0);

  if (cart.length===0){
    cartItems.innerHTML = `<div class="empty-cart"><p>Giỏ hàng trống</p><p style="font-size:.9rem;margin-top:.5rem;">Thêm món ăn vào giỏ hàng nhé!</p></div>`;
    cartTotal.textContent = '0đ'; return;
  }

  cartItems.innerHTML = cart.map(item=>`
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p style="color:#667eea;font-weight:bold;">${item.price.toLocaleString()}đ</p>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="decreaseQuantity(${item.id})">-</button>
          <span style="padding:0 1rem;font-weight:bold;">${item.quantity}</span>
          <button class="qty-btn" onclick="increaseQuantity(${item.id})">+</button>
          <button class="remove-item" onclick="removeFromCart(${item.id})">Xóa</button>
        </div>
      </div>
    </div>`).join('');

  const total = cart.reduce((s,i)=>s+i.price*i.quantity,0);
  cartTotal.textContent = total.toLocaleString()+'đ';
}
function increaseQuantity(id){ const it=cart.find(i=>i.id===id); if(it){it.quantity++; updateCart();} }
function decreaseQuantity(id){ const it=cart.find(i=>i.id===id); if(it && it.quantity>1){it.quantity--; updateCart();} }
function removeFromCart(id){ cart = cart.filter(i=>i.id!==id); updateCart(); }
function toggleCart(){
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('overlay');
  const ordersSidebar = document.getElementById('ordersSidebar');
  closeSupport(); closeLogin();
  ordersSidebar.classList.remove('active');
  sidebar.classList.toggle('active');
  overlay.classList.toggle('active', sidebar.classList.contains('active'));
}

/*************** ORDERS ***************/
function openOrders(){
  const ordersSidebar = document.getElementById('ordersSidebar');
  const cartSidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('overlay');
  closeSupport(); closeLogin();
  cartSidebar.classList.remove('active');
  ordersSidebar.classList.add('active');
  overlay.classList.add('active');
  renderOrders();
}
function closeOrders(){
  const ordersSidebar = document.getElementById('ordersSidebar');
  const overlay = document.getElementById('overlay');
  ordersSidebar.classList.remove('active');
  overlay.classList.remove('active');
}
function closePanels(){
  document.getElementById('cartSidebar').classList.remove('active');
  document.getElementById('ordersSidebar').classList.remove('active');
  closeSupport(); closeLogin();
  document.getElementById('overlay').classList.remove('active');
}

function renderOrders(){
  const list = document.getElementById('ordersList');
  if (!orders.length){
    list.innerHTML = `<div class="empty-cart" style="padding:2rem;"><p>Chưa có đơn hàng nào</p><p style="font-size:.9rem;margin-top:.5rem;">Bạn hãy đặt món để trải nghiệm nhé!</p></div>`;
    return;
  }

  list.innerHTML = orders.map(o=>{
    const statusClass = o.status==='processing'?'status-processing':(o.status==='shipping'?'status-shipping':'status-delivered');
    const itemsText = o.items.map(it=>`• ${escapeHTML(it.name)} x${it.quantity} — ${(it.price*it.quantity).toLocaleString()}đ`).join('<br>');
    let ratingUI='';
    if (o.status==='delivered'){
      if (typeof o.rating==='number'){
        const stars='★★★★★'.slice(0,o.rating)+'☆☆☆☆☆'.slice(0,5-o.rating);
        ratingUI=`<div class="review-display"><div><strong>Đánh giá của bạn:</strong> <span style="color:#f59e0b">${stars}</span></div>${o.review?`<div style="margin-top:4px;">${escapeHTML(o.review)}</div>`:''}</div>`;
      } else {
        ratingUI=`<div class="rating-block">
          <div class="stars">${[1,2,3,4,5].map(n=>`<span class="star" onclick="setRating('${o.id}',${n})" id="star-${o.id}-${n}">★</span>`).join('')}</div>
          <span class="rating-note">Hãy đánh dấu số sao</span>
          <textarea class="review-input" id="review-${o.id}" placeholder="Chia sẻ cảm nhận của bạn (không bắt buộc)"></textarea>
          <button class="submit-review" onclick="submitReview('${o.id}')">Gửi đánh giá</button>
        </div>`;
      }
    } else { ratingUI = `<div class="rating-note">Đánh giá sau khi đơn được giao</div>`; }

    return `<div class="order-card">
      <div class="order-top"><div class="order-id">Mã đơn: ${o.id}</div><div class="status-badge ${statusClass}">${o.status==='processing'?'Đang xử lý':(o.status==='shipping'?'Đang giao':'Đã giao')}</div></div>
      <div style="font-size:.85rem;color:#666;">${new Date(o.createdAt).toLocaleString()}</div>
      <div class="order-items" style="margin-top:6px;">${itemsText}</div>
      <div class="order-total">Tổng: ${o.total.toLocaleString()}đ</div>
      ${ratingUI}
    </div>`;
  }).join('');

  orders.forEach(o=>paintStars(o.id,o._tempRating||0));
}
function setRating(orderId,n){ const o=orders.find(x=>x.id===orderId); if(!o||o.status!=='delivered')return; o._tempRating=n; paintStars(orderId,n); }
function paintStars(orderId,n){ for(let i=1;i<=5;i++){ const el=document.getElementById(`star-${orderId}-${i}`); if(el) el.classList.toggle('active', i<=n); } }
function submitReview(orderId){
  const o=orders.find(x=>x.id===orderId); if(!o||o.status!=='delivered')return;
  const rating=o._tempRating||0; const review=(document.getElementById(`review-${orderId}`)?.value||'').trim();
  if(!rating){ alert('Vui lòng chọn số sao trước khi gửi đánh giá.'); return; }
  o.rating=rating; o.review=review; delete o._tempRating; saveOrders(); renderOrders(); showNotification('Cảm ơn bạn đã đánh giá!');
}

/*************** CHECKOUT ***************/
function checkout(){
  if(cart.length===0){ alert('Giỏ hàng trống!'); return; }
  const total = cart.reduce((s,i)=>s+i.price*i.quantity,0);
  const orderId = 'FD'+Date.now();
  const newOrder = { id: orderId, items: cart.map(i=>({id:i.id,name:i.name,price:i.price,quantity:i.quantity})), total, status: 'processing', createdAt: new Date().toISOString(), user: currentUser?.email || null };

  loadOrders(); orders.unshift(newOrder); saveOrders();
  alert(`Đặt hàng thành công!\n\nMã đơn: ${orderId}\nTổng tiền: ${total.toLocaleString()}đ\n\nChúng tôi sẽ giao hàng trong 30-45 phút!`);
  cart=[]; updateCart(); closePanels(); openOrders();
  setTimeout(()=>updateOrderStatus(orderId,'shipping'),5000);
  setTimeout(()=>updateOrderStatus(orderId,'delivered'),10000);
}
function updateOrderStatus(orderId,status){
  loadOrders(); const o=orders.find(x=>x.id===orderId); if(!o) return;
  o.status=status; saveOrders();
  if(document.getElementById('ordersSidebar').classList.contains('active')) renderOrders();
  if(status==='delivered') showNotification('Đơn đã giao! Bạn có thể đánh giá đơn hàng.');
}

/*************** FILTER CATEGORY ***************/
function filterCategory(category){ const filtered=menuItems.filter(i=>i.category===category); renderMenu(filtered); document.getElementById('menu').scrollIntoView({behavior:'smooth'}); }

/*************** LOGIN & SUPPORT ***************/
function openLogin(){
  document.getElementById('loginModal').classList.add('active');
  document.getElementById('overlay').classList.add('active');
  closeSupport(); // chỉ mở 1 modal
}
function closeLogin(){
  document.getElementById('loginModal').classList.remove('active');
  if (!document.getElementById('cartSidebar').classList.contains('active') &&
      !document.getElementById('ordersSidebar').classList.contains('active') &&
      !document.getElementById('supportModal').classList.contains('active')) {
    document.getElementById('overlay').classList.remove('active');
  }
}
function handleLogin(e){
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const pass  = document.getElementById('loginPassword').value.trim();
  if (!email || !pass){ alert('Vui lòng nhập đầy đủ Email và Mật khẩu.'); return false; }
  currentUser = { email, name: email.split('@')[0] };
  saveUser();
  updateNavAuth();
  showNotification('Đăng nhập thành công!');
  closeLogin();
  return false;
}
function logout(){
  currentUser = null; saveUser();
  updateNavAuth();
  showNotification('Đã đăng xuất.');
}
function updateNavAuth(){
  const btn = document.getElementById('authBtn');
  if (currentUser){
    btn.textContent = `👤 ${currentUser.name} (Đăng xuất)`;
    btn.onclick = (e)=>{ e.preventDefault(); logout(); };
  } else {
    btn.textContent = '🔐 Đăng nhập';
    btn.onclick = (e)=>{ e.preventDefault(); openLogin(); };
  }
}

function openSupport(){
  document.getElementById('supportModal').classList.add('active');
  document.getElementById('overlay').classList.add('active');
  closeLogin();
}
function closeSupport(){
  document.getElementById('supportModal').classList.remove('active');
}
function submitSupport(e){
  e.preventDefault();
  const name = document.getElementById('supName').value.trim();
  const email= document.getElementById('supEmail').value.trim();
  const msg  = document.getElementById('supMsg').value.trim();
  if (!name || !email || !msg){ alert('Vui lòng điền đủ thông tin.'); return false; }
  showNotification('Đã gửi yêu cầu hỗ trợ! Chúng tôi sẽ liên hệ sớm.');
  document.getElementById('supMsg').value='';
  closeSupport();
  return false;
}

/*************** UTILS ***************/
function showNotification(message){
  const n=document.createElement('div');
  n.style.cssText=`position:fixed;top:100px;right:20px;background:#10b981;color:#fff;padding:1rem 1.5rem;border-radius:10px;box-shadow:0 4px 15px rgba(0,0,0,.2);z-index:3000;animation:slideIn .3s ease;`;
  n.textContent=message; document.body.appendChild(n); setTimeout(()=>n.remove(),2000);
}
function escapeHTML(str){ return String(str).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

/*************** INIT ***************/
document.addEventListener('DOMContentLoaded', ()=>{
  loadUser(); loadOrders(); renderMenu(); updateCart(); updateNavAuth();

  // Logo => về hero + đóng panel
  const logo=document.getElementById('logoHome');
  if (logo){
    logo.addEventListener('click',(e)=>{ e.preventDefault(); closePanels(); document.getElementById('home')?.scrollIntoView({behavior:'smooth'}); });
  }
});
