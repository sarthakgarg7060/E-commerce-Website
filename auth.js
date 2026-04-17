import {
  loginWithEmail,
  loginWithGoogle,
  logoutUser,
  signUpWithEmail,
  watchAuthState
} from "./firebase.js";

const authForm = document.querySelector("#authForm");
const authCard = document.querySelector("#authCard");
const authStatus = document.querySelector("#authStatus");
const authMessage = document.querySelector("#authMessage");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const signupButton = document.querySelector("#signupBtn");
const emailLoginButton = document.querySelector("#emailLoginBtn");
const googleLoginButton = document.querySelector("#googleLoginBtn");
const logoutButton = document.querySelector("#logoutBtn");

function showAuthMessage(message, isError = false) {
  authMessage.textContent = message;
  authMessage.style.color = isError ? "#b42318" : "#214f38";
}

function getAuthFormValues() {
  return {
    email: emailInput.value.trim(),
    password: passwordInput.value.trim()
  };
}

function playSuccessAnimation() {
  authCard.style.transform = "scale(1.02)";
  authCard.style.boxShadow = "0 24px 60px rgba(47, 111, 79, 0.22)";

  setTimeout(() => {
    authCard.style.transform = "scale(1)";
  }, 220);
}

function redirectToHome() {
  setTimeout(() => {
    window.location.href = "index.html";
  }, 800);
}

async function handleSignup() {
  const { email, password } = getAuthFormValues();

  if (!email || !password) {
    showAuthMessage("Please enter both email and password.", true);
    return;
  }

  try {
    await signUpWithEmail(email, password);
    playSuccessAnimation();
    showAuthMessage("Account created successfully. Redirecting...", false);
    authForm.reset();
    redirectToHome();
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
    playSuccessAnimation();
    showAuthMessage("Logged in successfully. Redirecting...", false);
    authForm.reset();
    redirectToHome();
  } catch (error) {
    showAuthMessage(error.message, true);
  }
}

async function handleGoogleLogin() {
  try {
    await loginWithGoogle();
    playSuccessAnimation();
    showAuthMessage("Signed in with Google. Redirecting...", false);
    redirectToHome();
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
  signupButton.addEventListener("click", handleSignup);
  emailLoginButton.addEventListener("click", handleEmailLogin);
  googleLoginButton.addEventListener("click", handleGoogleLogin);
  logoutButton.addEventListener("click", handleLogout);

  watchAuthState((user) => {
    updateAuthUI(user);

    if (user) {
      showAuthMessage("Session found. Redirecting...", false);
      redirectToHome();
    }
  });
}

initializeAuthPage();
