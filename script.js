import {
  loginWithEmail,
  loginWithGoogle,
  logoutUser,
  signUpWithEmail,
  watchAuthState
} from "./firebase.js";

const products = [
  {
    id: 1,
    name: "Nova Phone X",
    price: 699,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 2,
    name: "AirBeat Headphones",
    price: 149,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 3,
    name: "Pulse Smartwatch",
    price: 199,
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 4,
    name: "Luma Watch",
    price: 129,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 5,
    name: "Stride Sneakers",
    price: 89,
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 6,
    name: "Runner Pro",
    price: 110,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80"
  }
];

const CART_STORAGE_KEY = "novacart-items";

const productGrid = document.querySelector("#productGrid");
const cartCount = document.querySelector(".cart-count");
const loginButton = document.querySelector(".login-btn");
const authForm = document.querySelector("#authForm");
const authSection = document.querySelector(".auth-section");
const authStatus = document.querySelector("#authStatus");
const authMessage = document.querySelector("#authMessage");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const signupButton = document.querySelector("#signupBtn");
const emailLoginButton = document.querySelector("#emailLoginBtn");
const googleLoginButton = document.querySelector("#googleLoginBtn");
const logoutButton = document.querySelector("#logoutBtn");

function formatPrice(price) {
  return `$${price}`;
}

function showAuthMessage(message, isError) {
  authMessage.textContent = message;
  authMessage.style.color = isError ? "#b42318" : "#214f38";
}

function getCartItems() {
  const storedCart = localStorage.getItem(CART_STORAGE_KEY);

  if (!storedCart) {
    return [];
  }

  try {
    return JSON.parse(storedCart);
  } catch (error) {
    console.error("Unable to read cart data from localStorage.", error);
    return [];
  }
}

function saveCartItems(cartItems) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
}

function updateCartCount() {
  const cartItems = getCartItems();
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;
}

function createProductCard(product) {
  return `
    <article class="product-card">
      <img src="${product.image}" alt="${product.name}">
      <div class="product-info">
        <h3>${product.name}</h3>
        <p class="price">${formatPrice(product.price)}</p>
        <button class="add-to-cart-btn" type="button" data-id="${product.id}">
          Add to Cart
        </button>
      </div>
    </article>
  `;
}

function renderProducts() {
  const productCards = products.map(createProductCard).join("");
  productGrid.innerHTML = productCards;
}

function addToCart(productId) {
  const selectedProduct = products.find((product) => product.id === productId);

  if (!selectedProduct) {
    return;
  }

  const cartItems = getCartItems();
  const existingItem = cartItems.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cartItems.push({
      id: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price,
      quantity: 1
    });
  }

  saveCartItems(cartItems);
  updateCartCount();
  alert(`${selectedProduct.name} added to cart!`);
}

function handleProductGridClick(event) {
  const addToCartButton = event.target.closest(".add-to-cart-btn");

  if (!addToCartButton) {
    return;
  }

  const productId = Number(addToCartButton.dataset.id);
  addToCart(productId);
}

function getAuthFormValues() {
  return {
    email: emailInput.value.trim(),
    password: passwordInput.value.trim()
  };
}

async function handleSignup() {
  const { email, password } = getAuthFormValues();

  if (!email || !password) {
    showAuthMessage("Please enter both email and password.", true);
    return;
  }

  try {
    await signUpWithEmail(email, password);
    showAuthMessage("Account created successfully.", false);
    authForm.reset();
  } catch (error) {
    showAuthMessage(error.message, true);
  }
}

async function handleEmailLogin() {
  const { email, password } = getAuthFormValues();

  if (!email || !password) {
    showAuthMessage("Please enter both email and password.", true);
    return;
  }

  try {
    await loginWithEmail(email, password);
    showAuthMessage("Logged in successfully.", false);
    authForm.reset();
  } catch (error) {
    showAuthMessage(error.message, true);
  }
}

async function handleGoogleLogin() {
  try {
    await loginWithGoogle();
    showAuthMessage("Signed in with Google.", false);
  } catch (error) {
    showAuthMessage(error.message, true);
  }
}

async function handleLogout() {
  try {
    await logoutUser();
    showAuthMessage("You have been logged out.", false);
  } catch (error) {
    showAuthMessage(error.message, true);
  }
}

function updateAuthUI(user) {
  if (user) {
    const displayName = user.displayName || user.email || "User";
    authStatus.textContent = `Logged in as ${displayName}`;
    loginButton.textContent = "Account";
    logoutButton.classList.remove("hidden");
  } else {
    authStatus.textContent = "You are not logged in.";
    loginButton.textContent = "Login";
    logoutButton.classList.add("hidden");
  }
}

function scrollToAuthSection() {
  authSection.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function initializeStore() {
  if (!productGrid || !cartCount) {
    return;
  }

  renderProducts();
  updateCartCount();

  productGrid.addEventListener("click", handleProductGridClick);
  loginButton.addEventListener("click", scrollToAuthSection);
  signupButton.addEventListener("click", handleSignup);
  emailLoginButton.addEventListener("click", handleEmailLogin);
  googleLoginButton.addEventListener("click", handleGoogleLogin);
  logoutButton.addEventListener("click", handleLogout);

  watchAuthState(updateAuthUI);
}

initializeStore();
