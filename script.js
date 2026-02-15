import { supabase, getCurrentUser, isUserLoggedIn } from './supabaseClient.js';

let products = [];
let cart = [];
let currentProduct = null;

document.addEventListener('DOMContentLoaded', async () => {
    await loadProducts();
    await loadCart();
    initializeEventListeners();
});

async function loadProducts() {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error loading products:', error);
        return;
    }

    products = data;
    displayProducts();
}

function displayProducts() {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = '';

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.image_url}" alt="${product.name}" loading="lazy">
            <p>${product.name}</p>
        `;
        card.onclick = () => openProductModal(product);
        gallery.appendChild(card);
    });
}

function openProductModal(product) {
    currentProduct = product;
    const modal = document.getElementById('productModal');
    const modalImg = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalPrice = document.getElementById('modalPrice');

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    modalImg.src = product.image_url;
    modalTitle.innerText = product.name;
    modalPrice.innerText = product.price.toFixed(2);

    // Create thumbnails (showing same image as example - you can add more images later)
    const thumbnails = document.getElementById('productThumbnails');
    thumbnails.innerHTML = `
        <img src="${product.image_url}" alt="Vue 1" class="active" onclick="changeMainImage('${product.image_url}')">
    `;
}

window.changeMainImage = function(imageUrl) {
    const modalImg = document.getElementById('modalImage');
    modalImg.src = imageUrl;

    // Update active thumbnail
    const thumbnails = document.querySelectorAll('.product-thumbnails img');
    thumbnails.forEach(thumb => {
        thumb.classList.remove('active');
        if (thumb.src.includes(imageUrl)) {
            thumb.classList.add('active');
        }
    });
};

function initializeEventListeners() {
    // Close modal
    const closeModal = document.querySelector('.close-modal');
    const modal = document.getElementById('productModal');

    closeModal.onclick = () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    };

    window.onclick = (e) => {
        if (e.target == modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    };

    // Add to cart
    const addToCartBtn = document.getElementById('addToCartBtn');
    addToCartBtn.onclick = async () => {
        const personalization = document.getElementById('personalizationText').value;
        await addToCart(currentProduct, personalization);
    };

    // Burger menu
    const menuBurger = document.querySelector('.menu-burger');
    const burgerMenu = document.getElementById('burgerMenu');
    const closeBurger = document.querySelector('.close-burger');

    menuBurger.onclick = () => {
        burgerMenu.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    closeBurger.onclick = () => {
        burgerMenu.classList.remove('active');
        document.body.style.overflow = 'auto';
    };

    // Burger menu links
    document.querySelectorAll('.burger-link').forEach(link => {
        link.onclick = () => {
            burgerMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        };
    });

    // Search
    const searchIcon = document.getElementById('searchIcon');
    const searchModal = document.getElementById('searchModal');
    const closeSearch = document.querySelector('.close-search');
    const searchInput = document.getElementById('searchInput');

    searchIcon.onclick = () => {
        searchModal.classList.add('active');
        searchInput.focus();
    };

    closeSearch.onclick = () => {
        searchModal.classList.remove('active');
    };

    searchInput.oninput = (e) => {
        const query = e.target.value.toLowerCase();
        searchProducts(query);
    };

    // User icon
    const userIcon = document.getElementById('userIcon');
    userIcon.onclick = () => {
        window.location.href = 'auth.html';
    };

    // Cart icon
    const cartIcon = document.getElementById('cartIcon');
    const cartSidebar = document.getElementById('cartSidebar');
    const closeCart = document.querySelector('.close-cart');

    cartIcon.onclick = () => {
        cartSidebar.classList.add('active');
    };

    closeCart.onclick = () => {
        cartSidebar.classList.remove('active');
    };

    // Checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    checkoutBtn.onclick = async () => {
        const loggedIn = await isUserLoggedIn();
        if (!loggedIn) {
            alert('Veuillez vous connecter pour passer commande');
            window.location.href = 'auth.html';
            return;
        }
        window.location.href = 'checkout.html';
    };

    // Delivery info tooltip
    const deliveryInfo = document.getElementById('deliveryInfo');
    const deliveryTooltip = document.getElementById('deliveryTooltip');

    deliveryInfo.onmouseenter = (e) => {
        deliveryTooltip.classList.add('show');
        const rect = deliveryInfo.getBoundingClientRect();
        deliveryTooltip.style.top = (rect.bottom + 10) + 'px';
        deliveryTooltip.style.left = rect.left + 'px';
    };

    deliveryInfo.onmouseleave = () => {
        deliveryTooltip.classList.remove('show');
    };
}

function searchProducts(query) {
    const searchResults = document.getElementById('searchResults');

    if (!query) {
        searchResults.innerHTML = '';
        return;
    }

    const results = products.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
    );

    if (results.length === 0) {
        searchResults.innerHTML = '<p style="padding: 20px; text-align: center; color: #999;">Aucun produit trouvé</p>';
        return;
    }

    searchResults.innerHTML = results.map(product => `
        <div class="search-result-item" onclick="selectSearchResult('${product.id}')">
            <img src="${product.image_url}" alt="${product.name}">
            <div class="search-result-info">
                <h4>${product.name}</h4>
                <p>${product.price.toFixed(2)} €</p>
            </div>
        </div>
    `).join('');
}

window.selectSearchResult = function(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        document.getElementById('searchModal').classList.remove('active');
        document.getElementById('searchInput').value = '';
        document.getElementById('searchResults').innerHTML = '';
        openProductModal(product);
    }
};

async function addToCart(product, personalization = '') {
    const user = await getCurrentUser();

    if (!user) {
        // Guest cart (localStorage)
        const cartItem = {
            id: Date.now().toString(),
            product_id: product.id,
            product,
            quantity: 1,
            personalization
        };
        cart.push(cartItem);
        localStorage.setItem('guestCart', JSON.stringify(cart));
    } else {
        // Logged-in user cart (database)
        const { error } = await supabase
            .from('cart_items')
            .insert({
                user_id: user.id,
                product_id: product.id,
                quantity: 1,
                personalization
            });

        if (error) {
            console.error('Error adding to cart:', error);
            alert('Erreur lors de l\'ajout au panier');
            return;
        }

        await loadCart();
    }

    updateCartDisplay();
    alert('Produit ajouté au panier !');

    // Close modal
    document.getElementById('productModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    document.getElementById('personalizationText').value = '';
}

async function loadCart() {
    const user = await getCurrentUser();

    if (!user) {
        // Load guest cart from localStorage
        const guestCart = localStorage.getItem('guestCart');
        cart = guestCart ? JSON.parse(guestCart) : [];
    } else {
        // Load user cart from database
        const { data, error } = await supabase
            .from('cart_items')
            .select(`
                *,
                product:products(*)
            `)
            .eq('user_id', user.id);

        if (error) {
            console.error('Error loading cart:', error);
            cart = [];
        } else {
            cart = data;
        }
    }

    updateCartDisplay();
}

function updateCartDisplay() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');

    cartCount.textContent = cart.length;

    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart">Votre panier est vide</div>';
        cartTotal.textContent = '0,00 €';
        return;
    }

    let total = 0;
    cartItems.innerHTML = cart.map(item => {
        const product = item.product || item.product;
        const price = product.price * item.quantity;
        total += price;

        return `
            <div class="cart-item">
                <img src="${product.image_url}" alt="${product.name}">
                <div class="cart-item-info">
                    <h4>${product.name}</h4>
                    ${item.personalization ? `<p>Message: ${item.personalization}</p>` : ''}
                    <p>Quantité: ${item.quantity}</p>
                    <p class="cart-item-price">${price.toFixed(2)} €</p>
                    <span class="cart-item-remove" onclick="removeFromCart('${item.id}')">Retirer</span>
                </div>
            </div>
        `;
    }).join('');

    cartTotal.textContent = total.toFixed(2) + ' €';
}

window.removeFromCart = async function(itemId) {
    const user = await getCurrentUser();

    if (!user) {
        // Remove from guest cart
        cart = cart.filter(item => item.id !== itemId);
        localStorage.setItem('guestCart', JSON.stringify(cart));
    } else {
        // Remove from database
        const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('id', itemId);

        if (error) {
            console.error('Error removing from cart:', error);
            return;
        }

        await loadCart();
    }

    updateCartDisplay();
};

export { cart, products };
