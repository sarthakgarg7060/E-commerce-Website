import {
  loginWithEmail,
  loginWithGoogle,
  logoutUser,
  signUpWithEmail,
  watchAuthState
} from "./firebase.js";

const authForm = document.querySelector("#authForm");
const authStatus = document.querySelector("#authStatus");
const authMessage = document.querySelector("#authMessage");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const signupButton = document.querySelector("#signupBtn");
const emailLoginButton = document.querySelector("#emailLoginBtn");
const googleLoginButton = document.querySelector("#googleLoginBtn");
const logoutButton = document.querySelector("#logoutBtn");

function showAuthMessage(message, isError) {
  authMessage.textContent = message;
  authMessage.style.color = isError ? "#b42318" : "#214f38";
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
    logoutButton.classList.remove("hidden");
  } else {
    authStatus.textContent = "You are not logged in.";
    logoutButton.classList.add("hidden");
  }
}

function initializeAuthPage() {
  if (!signupButton) {
    return;
  }

  signupButton.addEventListener("click", handleSignup);
  emailLoginButton.addEventListener("click", handleEmailLogin);
  googleLoginButton.addEventListener("click", handleGoogleLogin);
  logoutButton.addEventListener("click", handleLogout);

  watchAuthState(updateAuthUI);
}

initializeAuthPage();
