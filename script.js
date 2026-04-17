import {
  getAllProducts,
  loginWithEmail,
  loginWithGoogle,
  logoutUser,
  signUpWithEmail,
  watchAuthState
} from "./firebase.js";

const CART_STORAGE_KEY = "novacart-items";
let products = [];

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

function showAuthMessage(message, isError = false) {
  if (!authMessage) {
    return;
  }

  authMessage.textContent = message;
  authMessage.style.color = isError ? "#b42318" : "var(--accent-dark)";
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
  if (!cartCount) {
    return;
  }

  const cartItems = getCartItems();
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;
}

function createProductCard(product) {
  return `
    <article class="product-card">
      <img src="${product.image || "https://via.placeholder.com/600x400?text=No+Image"}" alt="${product.name}">
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
  if (!productGrid) {
    return;
  }

  if (!products.length) {
    productGrid.innerHTML = `<p class="auth-message">No products found in Firestore.</p>`;
    return;
  }

  const productCards = products.map((product) => createProductCard(product)).join("");
  productGrid.innerHTML = productCards;
}

async function loadProductsFromFirestore() {
  if (!productGrid) {
    return;
  }

  productGrid.innerHTML = `<p class="auth-message">Loading products...</p>`;

  try {
    products = await getAllProducts();
    renderProducts();
  } catch (error) {
    console.error("Unable to fetch Firestore products.", error);
    productGrid.innerHTML = `<p class="auth-message" style="color:#b42318;">Unable to load products from Firestore.</p>`;
  }
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

  const productId = addToCartButton.dataset.id;
  addToCart(productId);
}

function getAuthFormValues() {
  return {
    email: emailInput?.value.trim() ?? "",
    password: passwordInput?.value.trim() ?? ""
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
    showAuthMessage("Account created successfully.");
    authForm?.reset();
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
    showAuthMessage("Logged in successfully.");
    authForm?.reset();
  } catch (error) {
    showAuthMessage(error.message, true);
  }
}

async function handleGoogleLogin() {
  try {
    await loginWithGoogle();
    showAuthMessage("Signed in with Google.");
  } catch (error) {
    showAuthMessage(error.message, true);
  }
}

async function handleLogout() {
  try {
    await logoutUser();
    showAuthMessage("You have been logged out.");
  } catch (error) {
    showAuthMessage(error.message, true);
  }
}

function updateAuthUI(user) {
  if (!authStatus || !loginButton || !logoutButton) {
    return;
  }

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
  authSection?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function initializeStore() {
  await loadProductsFromFirestore();
  updateCartCount();

  productGrid?.addEventListener("click", handleProductGridClick);
  loginButton?.addEventListener("click", scrollToAuthSection);
  signupButton?.addEventListener("click", handleSignup);
  emailLoginButton?.addEventListener("click", handleEmailLogin);
  googleLoginButton?.addEventListener("click", handleGoogleLogin);
  logoutButton?.addEventListener("click", handleLogout);

  watchAuthState(updateAuthUI);
}

initializeStore();
