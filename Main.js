// Variables globales
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
let productos = [];

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar
    initMenuToggle();
    updateCartCount();
    
    // Si estamos en la página de productos, cargarlos
    if (document.getElementById('featuredProducts')) {
        loadFeaturedProducts();
    }
    
    // Timer de promoción
    if (document.getElementById('promoTimer')) {
        startPromoTimer();
    }
    
    // Event listeners globales
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-to-cart')) {
            const productId = parseInt(e.target.dataset.id);
            addToCart(productId);
        }
        
        if (e.target.classList.contains('category-card')) {
            e.preventDefault();
            const category = e.target.dataset.category;
            filterByCategory(category);
        }
    });
});

// Menú responsive
function initMenuToggle() {
    const menuToggle = document.getElementById('menuToggle');
    const nav = document.querySelector('.nav');
    
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
            menuToggle.innerHTML = nav.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
        
        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!nav.contains(e.target) && !menuToggle.contains(e.target)) {
                nav.classList.remove('active');
                menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    }
}

// Cargar productos destacados
async function loadFeaturedProducts() {
    try {
        const response = await fetch('data/productos.json');
        const data = await response.json();
        productos = data.productos;
        
        const featuredContainer = document.getElementById('featuredProducts');
        const featuredProducts = productos.filter(p => p.destacado);
        
        featuredContainer.innerHTML = featuredProducts.map(product => `
            <div class="product-card">
                ${product.descuento > 0 ? `<span class="discount-badge">-${product.descuento}%</span>` : ''}
                <div class="product-image">
                    <img src="${product.imagen}" alt="${product.nombre}">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.nombre}</h3>
                    <p class="product-description">${product.descripcion}</p>
                    
                    <div class="product-rating">
                        ${generateStars(product.rating)}
                        <span>(${product.rating})</span>
                    </div>
                    
                    <div class="product-price">
                        $${product.precio.toFixed(2)}
                        ${product.precio_original ? `<span class="original-price">$${product.precio_original.toFixed(2)}</span>` : ''}
                    </div>
                    
                    <button class="add-to-cart" data-id="${product.id}">
                        <i class="fas fa-cart-plus"></i> Agregar al Carrito
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error cargando productos:', error);
    }
}

// Generar estrellas de rating
function generateStars(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i === fullStars && hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

// Actualizar contador del carrito
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

// Agregar al carrito
function addToCart(productId) {
    const product = productos.find(p => p.id === productId);
    
    if (!product) {
        showNotification('Producto no encontrado', 'error');
        return;
    }
    
    const existingItem = carrito.find(item => item.id === productId);
    
    if (existingItem) {
        if (existingItem.cantidad >= product.stock) {
            showNotification('Stock insuficiente', 'error');
            return;
        }
        existingItem.cantidad++;
    } else {
        carrito.push({
            ...product,
            cantidad: 1
        });
    }
    
    // Guardar en localStorage
    localStorage.setItem('carrito', JSON.stringify(carrito));
    
    // Actualizar UI
    updateCartCount();
    showNotification(`${product.nombre} agregado al carrito`, 'success');
}

// Filtrar por categoría
function filterByCategory(category) {
    window.location.href = `productos.html?categoria=${category}`;
}

// Timer de promoción
function startPromoTimer() {
    const timerElement = document.getElementById('promoTimer');
    let timeLeft = 2 * 60 * 60 + 15 * 60 + 30; // 2h 15m 30s
    
    const timer = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timer);
            timerElement.textContent = '¡Oferta finalizada!';
            return;
        }
        
        const hours = Math.floor(timeLeft / 3600);
        const minutes = Math.floor((timeLeft % 3600) / 60);
        const seconds = timeLeft % 60;
        
        timerElement.textContent = `Termina en: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        timeLeft--;
    }, 1000);
}

// Mostrar notificaciones
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    // Estilos
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    // Animación
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Botón de cerrar
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}