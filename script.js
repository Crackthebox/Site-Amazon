// Fișier JavaScript pentru proiect

class User {
    constructor(username) {
        this.username = username;
        this.loginDate = new Date().toLocaleString(); // Add login date
    }

    login() {
        localStorage.setItem('user', JSON.stringify(this));
    }

    static logout() {
        localStorage.removeItem('user');
    }

    static getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
}

class ShoppingCart {
    static getCart() {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    }

    static saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    static addItem(item) {
        const cart = this.getCart();
        cart.push(item);
        this.saveCart(cart);
    }

    static clearCart() {
        localStorage.removeItem('cart');
    }
}

async function fetchPlants() {
    try {
        const response = await fetch('plante.json');
        const plants = await response.json();
        return plants;
    } catch (error) {
        console.error('Eroare la încărcarea plantelor:', error);
    }
}

function renderPlants(plants) {
    const plantListings = document.getElementById('plant-listings');
    if (!plantListings) return;

    plantListings.innerHTML = '';
    plants.forEach(plant => {
        const plantCard = document.createElement('div');
        plantCard.className = 'plant-card';
        plantCard.innerHTML = `
            <img src="${plant.imagine}" alt="${plant.nume}" style="width: 100%; height: 200px; object-fit: cover;">
            <div style="padding: 15px;">
                <h3>${plant.nume}</h3>
                <p>${plant.descriere.substring(0, 100)}...</p>
                <p style="font-weight: bold; margin-top: 10px;">Preț: ${plant.pret} RON</p>
                <button class="add-to-cart-btn" data-id="${plant.id}">Adaugă în coș</button>
            </div>
        `;
        plantListings.appendChild(plantCard);
    });
}

function renderCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    if (!cartItems || !cartTotal) return;

    const cart = ShoppingCart.getCart();
    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <span>${item.nume}</span>
            <span>${item.pret} RON</span>
        `;
        cartItems.appendChild(cartItem);
        total += item.pret;
    });

    cartTotal.textContent = total;
}

function updatePlantTitleColors() {
    const cart = ShoppingCart.getCart();
    const cartIds = new Set(cart.map(item => item.id));
    const plantCards = document.querySelectorAll('.plant-card');
    plantCards.forEach(card => {
        const button = card.querySelector('.add-to-cart-btn');
        if (button) {
            const plantId = parseInt(button.dataset.id);
            const title = card.querySelector('h3');
            if (title) {
                if (cartIds.has(plantId)) {
                    title.style.color = 'red';
                } else {
                    title.style.color = ''; // Revert to default
                }
            }
        }
    });
}

function showTemporaryMessage(message, element) {
    const msgElement = document.createElement('div');
    msgElement.textContent = message;
    msgElement.className = 'added-to-cart-message';
    element.appendChild(msgElement);
    setTimeout(() => {
        msgElement.remove();
    }, 4000);
}

document.addEventListener('DOMContentLoaded', async () => {
    const loginForm = document.getElementById('login-form');
    const logoutLi = document.getElementById('logout-li');
    const loginLi = document.getElementById('login-form-li');
    const welcomeMessage = document.getElementById('welcome-message');
    const logoutButton = document.getElementById('logout-button');
    const marketplace = document.getElementById('marketplace');
    const shoppingCartSection = document.getElementById('shopping-cart');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const usernameError = document.getElementById('username-error');
    const canvas = document.getElementById('map-canvas');

    const user = User.getCurrentUser();
    let plants = [];

    if (user) {
        if (loginLi) loginLi.style.display = 'none';
        if (logoutLi) logoutLi.style.display = 'flex';
                if (welcomeMessage) {
            welcomeMessage.textContent = `Bun venit, ${user.username}!`;
            welcomeMessage.style.color = 'black'; // Set text color to black
            setTimeout(() => {
                welcomeMessage.style.display = 'none';
            }, 3000);
        }
        if (marketplace) marketplace.style.display = 'block';
        if (shoppingCartSection) shoppingCartSection.style.display = 'block';

        plants = await fetchPlants();
        if (plants) {
            renderPlants(plants);
            updatePlantTitleColors();
        }
        renderCart();
    } else {
        if (loginLi) loginLi.style.display = 'flex';
        if (logoutLi) logoutLi.style.display = 'none';
        if (marketplace) marketplace.style.display = 'none';
        if (shoppingCartSection) shoppingCartSection.style.display = 'none';
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const usernameInput = document.getElementById('username');
            const username = usernameInput.value;
            const usernameRegex = /^[a-zA-Z0-9]{3,15}$/;

            if (!usernameRegex.test(username)) {
                usernameError.textContent = 'Utilizatorul trebuie să aibă între 3 și 15 caractere alfanumerice.';
                return;
            }
            usernameError.textContent = '';
            const user = new User(username);
            user.login();
            showTemporaryMessage('Login successful!', loginForm.parentElement); // Show success message
            location.reload();
        });
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            User.logout();
            location.reload();
        });
    }

    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            e.stopPropagation(); // Prevent card click event from firing
            const plantId = parseInt(e.target.dataset.id);
            const plant = plants.find(p => p.id === plantId);
            if (plant) {
                ShoppingCart.addItem(plant);
                renderCart();
                updatePlantTitleColors();
                showTemporaryMessage('Adăugat în coș!', e.target.parentElement);
            }
        }
        
        if (e.target.closest('.plant-card')) {
             const card = e.target.closest('.plant-card');
             const computedStyle = getComputedStyle(card);
             console.log(`BackgroundColor of card: ${computedStyle.backgroundColor}`);
        }
    });

    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            ShoppingCart.clearCart();
            renderCart();
            updatePlantTitleColors();
        });
    }

    // Event listeners for random shadow color
    document.body.addEventListener('mouseenter', (e) => {
        if (e.target.classList.contains('plant-card')) {
            const r = Math.floor(Math.random() * 256);
            const g = Math.floor(Math.random() * 256);
            const b = Math.floor(Math.random() * 256);
            e.target.style.boxShadow = `0 4px 8px rgba(${r},${g},${b},0.5)`;
        }
    }, true);

    document.body.addEventListener('mouseleave', (e) => {
        if (e.target.classList.contains('plant-card')) {
            e.target.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
        }
    }, true);

    // Canvas Map Logic
    if (canvas) {
        const ctx = canvas.getContext('2d');
        const mapImage = new Image();
        mapImage.src = 'am2.jpg';

        const originalWidth = 1200; // Original width of am2.jpg
        const originalHeight = 900; // Original height of am2.jpg

        const hotspots = [
            // Cities (yellow)
            { x: 250, y: 480, radius: 10, info: 'Iquitos, Peru', wiki: 'https://en.wikipedia.org/wiki/Iquitos', color: 'yellow' },
            { x: 350, y: 420, radius: 10, info: 'Leticia, Colombia', wiki: 'https://en.wikipedia.org/wiki/Leticia,_Colombia', color: 'yellow' },
            { x: 600, y: 550, radius: 12, info: 'Manaus, Brazil', wiki: 'https://en.wikipedia.org/wiki/Manaus', color: 'yellow' },
            { x: 800, y: 650, radius: 10, info: 'Santarém, Brazil', wiki: 'https://en.wikipedia.org/wiki/Santar%C3%A9m,_Par%C3%A1', color: 'yellow' },
            { x: 880, y: 720, radius: 12, info: 'Belém, Brazil', wiki: 'https://en.wikipedia.org/wiki/Bel%C3%A9m', color: 'yellow' },

            // Rivers (blue)
            { x: 550, y: 430, radius: 8, info: 'Rio Negro', wiki: 'https://en.wikipedia.org/wiki/Rio_Negro_(Amazon)', color: 'blue' },
            { x: 650, y: 580, radius: 8, info: 'Madeira River', wiki: 'https://en.wikipedia.org/wiki/Madeira_River', color: 'blue' },
            { x: 450, y: 500, radius: 8, info: 'Amazon River', wiki: 'https://en.wikipedia.org/wiki/Amazon_River', color: 'blue' },

            // Natural Landmark (green)
            { x: 480, y: 380, radius: 8, info: 'Anavilhanas National Park', wiki: 'https://en.wikipedia.org/wiki/Anavilhanas_National_Park', color: 'green' },
            { x: 450, y: 450, radius: 8, info: 'Jaú National Park', wiki: 'https://en.wikipedia.org/wiki/Ja%C3%BA_National_Park', color: 'green' },
            { x: 200, y: 150, radius: 8, info: 'Pico da Neblina National Park', wiki: 'https://en.wikipedia.org/wiki/Pico_da_Neblina_National_Park', color: 'green' },
            { x: 700, y: 250, radius: 8, info: 'Tumucumaque Mountains National Park', wiki: 'https://en.wikipedia.org/wiki/Tumucumaque_Mountains_National_Park', color: 'green' },
            { x: 100, y: 500, radius: 8, info: 'Serra do Divisor National Park', wiki: 'https://en.wikipedia.org/wiki/Serra_do_Divisor_National_Park', color: 'green' },

            // New Rivers (blue)
            { x: 500, y: 350, radius: 8, info: 'Japurá River', wiki: 'https://en.wikipedia.org/wiki/Japur%C3%A1_River', color: 'blue' },
            { x: 400, y: 300, radius: 8, info: 'Putumayo River', wiki: 'https://en.wikipedia.org/wiki/Putumayo_River', color: 'blue' }
        ];

        let activeHotspot = null;
        let scale = 1;
        let infoBox = null;

        function drawInfoBox(hotspot) {
            const x = hotspot.x * scale;
            const y = hotspot.y * scale;
            const text = hotspot.info;
            
            ctx.font = `bold ${14 * scale}px Arial`;
            const textWidth = ctx.measureText(text).width;
            
            const boxWidth = textWidth + (20 * scale);
            const boxHeight = 30 * scale;
            const boxX = x - (boxWidth / 2);
            const boxY = y - (hotspot.radius * scale) - boxHeight - (5 * scale);

            infoBox = { x: boxX, y: boxY, width: boxWidth, height: boxHeight, hotspot: hotspot };

            // Draw box
            ctx.fillStyle = 'rgba(0, 21, 64, 0.85)';
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(boxX, boxY, boxWidth, boxHeight, [5 * scale]);
            ctx.fill();
            ctx.stroke();

            // Draw text
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, x, boxY + (boxHeight / 2));
        }

        function draw() {
            scale = canvas.width / originalWidth;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(mapImage, 0, 0, canvas.width, canvas.height);

            let hoveredHotspot = null;
            hotspots.forEach(hotspot => {
                const pulseFactor = Math.sin(Date.now() / 200);
                const currentRadius = hotspot.radius * scale * (1 + 0.1 * pulseFactor);
                
                if (hotspot.color === 'blue') {
                    ctx.fillStyle = 'rgba(0, 0, 255, 0.7)';
                } else if (hotspot.color === 'green') {
                    ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
                } else {
                    ctx.fillStyle = 'rgba(255, 255, 0, 0.7)';
                }

                ctx.strokeStyle = 'white';
                ctx.lineWidth = 2;

                ctx.beginPath();
                ctx.arc(hotspot.x * scale, hotspot.y * scale, currentRadius, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                const dx = canvas.mouseX - (hotspot.x * scale);
                const dy = canvas.mouseY - (hotspot.y * scale);
                if (Math.sqrt(dx * dx + dy * dy) < (hotspot.radius * scale)) {
                    hoveredHotspot = hotspot;
                }
            });

            if (hoveredHotspot || (infoBox && activeHotspot && canvas.mouseX > infoBox.x && canvas.mouseX < infoBox.x + infoBox.width && canvas.mouseY > infoBox.y && canvas.mouseY < infoBox.y + infoBox.height)) {
                canvas.style.cursor = 'pointer';
            } else {
                canvas.style.cursor = 'default';
            }

            if (activeHotspot) {
                drawInfoBox(activeHotspot);
            } else {
                infoBox = null;
            }
        }
        
        function animate() {
            draw();
            requestAnimationFrame(animate);
        }

        function resizeCanvas() {
            const container = canvas.parentElement;
            const maxWidth = 1000;
            let width = container.clientWidth;
            if (width > maxWidth) {
                width = maxWidth;
            }
            canvas.width = width;
            canvas.height = (width / originalWidth) * originalHeight;
        }

        mapImage.onload = () => {
            resizeCanvas();
            animate();
        };

        window.addEventListener('resize', resizeCanvas);

        canvas.addEventListener('mousemove', (e) => {
            canvas.mouseX = e.offsetX;
            canvas.mouseY = e.offsetY;
        });

        canvas.addEventListener('click', (e) => {
            const mouseX = e.offsetX;
            const mouseY = e.offsetY;

            if (infoBox && activeHotspot && mouseX > infoBox.x && mouseX < infoBox.x + infoBox.width && mouseY > infoBox.y && mouseY < infoBox.y + infoBox.height) {
                window.open(activeHotspot.wiki, '_blank');
                return;
            }

            let clickedHotspot = null;
            // Iterate backwards to prioritize clicking top-most hotspots
            for (let i = hotspots.length - 1; i >= 0; i--) {
                const hotspot = hotspots[i];
                const dx = mouseX - (hotspot.x * scale);
                const dy = mouseY - (hotspot.y * scale);
                if (Math.sqrt(dx * dx + dy * dy) < (hotspot.radius * scale)) {
                    clickedHotspot = hotspot;
                    break;
                }
            }

            activeHotspot = clickedHotspot;
        });
    }
});