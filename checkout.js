import { supabase, getCurrentUser } from './supabaseClient.js';

let cart = [];
let orderTotal = 0;

document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    await loadCheckoutCart();
    initializeCheckout();
});

async function checkAuth() {
    const user = await getCurrentUser();
    if (!user) {
        alert('Veuillez vous connecter pour continuer');
        window.location.href = 'auth.html';
    }
}

async function loadCheckoutCart() {
    const user = await getCurrentUser();

    if (!user) {
        // Load from localStorage if not logged in
        const guestCart = localStorage.getItem('guestCart');
        cart = guestCart ? JSON.parse(guestCart) : [];
    } else {
        // Load from database
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

    displayOrderSummary();
}

function displayOrderSummary() {
    const orderItems = document.getElementById('orderItems');
    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('total');

    if (cart.length === 0) {
        orderItems.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">Votre panier est vide</p>';
        return;
    }

    let subtotal = 0;
    orderItems.innerHTML = cart.map(item => {
        const product = item.product;
        const itemTotal = product.price * item.quantity;
        subtotal += itemTotal;

        return `
            <div class="summary-item">
                <div>
                    <strong style="font-size: 13px;">${product.name}</strong>
                    ${item.personalization ? `<br><span style="font-size: 11px; color: #666;">Message: ${item.personalization}</span>` : ''}
                    <br><span style="font-size: 12px;">Quantité: ${item.quantity}</span>
                </div>
                <span>${itemTotal.toFixed(2)} €</span>
            </div>
        `;
    }).join('');

    orderTotal = subtotal;
    subtotalEl.textContent = subtotal.toFixed(2) + ' €';
    totalEl.textContent = orderTotal.toFixed(2) + ' €';
}

function initializeCheckout() {
    // Payment method selection
    const paymentMethods = document.querySelectorAll('.payment-method');
    const paymentForms = document.querySelectorAll('.payment-form');

    paymentMethods.forEach(method => {
        method.onclick = () => {
            // Remove active class from all
            paymentMethods.forEach(m => m.classList.remove('active'));
            paymentForms.forEach(f => f.classList.remove('active'));

            // Add active class to selected
            method.classList.add('active');
            const selectedMethod = method.getAttribute('data-method');
            const radio = method.querySelector('input[type="radio"]');
            radio.checked = true;

            // Show corresponding form
            const formId = selectedMethod + 'PaymentForm';
            document.getElementById(formId).classList.add('active');
        };
    });

    // Format card number
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.oninput = (e) => {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        };
    }

    // Format expiry date
    const cardExpiryInput = document.getElementById('cardExpiry');
    if (cardExpiryInput) {
        cardExpiryInput.oninput = (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4);
            }
            e.target.value = value;
        };
    }

    // CVV validation
    const cardCvvInput = document.getElementById('cardCvv');
    if (cardCvvInput) {
        cardCvvInput.oninput = (e) => {
            e.target.value = e.target.value.replace(/\D/g, '');
        };
    }

    // Place order button
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    placeOrderBtn.onclick = async () => {
        await placeOrder();
    };
}

async function placeOrder() {
    // Validate shipping form
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const city = document.getElementById('city').value;
    const zipCode = document.getElementById('zipCode').value;
    const country = document.getElementById('country').value;

    if (!fullName || !email || !phone || !address || !city || !zipCode || !country) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }

    // Get selected payment method
    const paymentMethodRadio = document.querySelector('input[name="paymentMethod"]:checked');
    if (!paymentMethodRadio) {
        alert('Veuillez sélectionner une méthode de paiement');
        return;
    }

    const paymentMethod = paymentMethodRadio.value;

    // Validate payment method specific fields
    if (paymentMethod === 'card') {
        const cardNumber = document.getElementById('cardNumber').value;
        const cardExpiry = document.getElementById('cardExpiry').value;
        const cardCvv = document.getElementById('cardCvv').value;

        if (!cardNumber || !cardExpiry || !cardCvv) {
            alert('Veuillez remplir tous les champs de la carte');
            return;
        }

        // Basic validation
        const cleanCardNumber = cardNumber.replace(/\s/g, '');
        if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
            alert('Numéro de carte invalide');
            return;
        }

        if (cardCvv.length < 3) {
            alert('CVV invalide');
            return;
        }
    }

    // Create order
    const user = await getCurrentUser();
    const shippingAddress = {
        fullName,
        email,
        phone,
        address,
        city,
        zipCode,
        country
    };

    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
            user_id: user.id,
            total_amount: orderTotal,
            status: 'pending',
            payment_method: paymentMethod,
            shipping_address: shippingAddress
        })
        .select()
        .single();

    if (orderError) {
        console.error('Error creating order:', orderError);
        alert('Erreur lors de la création de la commande');
        return;
    }

    // Create order items
    const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
        personalization: item.personalization || ''
    }));

    const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

    if (itemsError) {
        console.error('Error creating order items:', itemsError);
        alert('Erreur lors de la création de la commande');
        return;
    }

    // Clear cart
    const { error: clearError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

    if (clearError) {
        console.error('Error clearing cart:', clearError);
    }

    // Clear localStorage if exists
    localStorage.removeItem('guestCart');

    // Success
    alert('Commande passée avec succès ! Numéro de commande: ' + order.id.substring(0, 8));
    window.location.href = 'index.html';
}
