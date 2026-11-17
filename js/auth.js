import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Local Storage Keys
const SESSION_KEY = 'foodopedia_current_user';

// Centralized Like System
function getLikedFoods() {
  return JSON.parse(localStorage.getItem("likedFoods")) || [];
}

function updateLikeCount() {
  const countElement = document.getElementById("like-count");
  if (countElement) {
    const likedItems = getLikedFoods();
    countElement.innerText = likedItems.length;
  }
}

// Update count on page load
document.addEventListener("DOMContentLoaded", updateLikeCount);

function toggleLike(id, event, callback) {
  if (event) event.stopPropagation();
  let likedItems = getLikedFoods();
  const isLiking = !likedItems.includes(id);

  if (!isLiking) {
    likedItems = likedItems.filter(item => item !== id);
  } else {
    likedItems.push(id);
  }

  localStorage.setItem("likedFoods", JSON.stringify(likedItems));
  updateLikeCount();

  // Optimized UI update: toggle heart class without re-rendering everything
  if (event && event.currentTarget) {
    const heart = event.currentTarget.querySelector('.heart-icon');
    if (heart) {
      if (isLiking) heart.classList.add('liked');
      else heart.classList.remove('liked');
    }
  }

  if (callback) callback();
}

// Helper to get image path with fallback
function getImagePath(imageArray) {
  if (!imageArray || imageArray.length === 0) {
    // If no specific image, try to return a generic one or a transparent pixel to avoid broken icons
    return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=500&auto=format&fit=crop'; 
  }
  return `assets/images/${imageArray[0]}`;
}

// Helper for Veg/Non-Veg Icons
function getTypeIcon(type) {
  if (type === 'Veg') return '🟢';
  if (type === 'Non-Veg') return '🔴';
  return '🟡'; // Both or undefined
}

// ================= FEEDBACK SYSTEM =================
function injectFeedbackSystem() {
  // Don't show on auth page
  if (window.location.href.includes('auth.html')) return;

  const style = document.createElement('style');
  style.innerHTML = `
    .feedback-btn {
      position: fixed;
      bottom: 25px;
      right: 25px;
      background: linear-gradient(135deg, #ff416c, #e83b3b);
      color: white;
      width: 55px;
      height: 55px;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 8px 20px rgba(232, 59, 59, 0.3);
      font-size: 26px;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .feedback-btn:hover { 
      transform: translateY(-5px) scale(1.1);
      box-shadow: 0 12px 25px rgba(232, 59, 59, 0.4);
    }
    
    .feedback-modal {
      display: none;
      position: fixed;
      bottom: 95px;
      right: 25px;
      width: 320px;
      background: #fff;
      padding: 24px;
      border-radius: 16px;
      box-shadow: 0 15px 40px rgba(0,0,0,0.15);
      z-index: 1001;
      animation: slideUpIn 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
      border: 1px solid rgba(0,0,0,0.05);
      box-sizing: border-box;
    }
    .feedback-modal * { box-sizing: border-box; }
    @keyframes slideUpIn { 
      from { transform: translateY(30px) scale(0.95); opacity: 0; } 
      to { transform: translateY(0) scale(1); opacity: 1; } 
    }
    
    .feedback-modal h3 { 
      margin: 0 0 10px 0; 
      color: #1a1a1a; 
      font-size: 20px; 
      font-weight: 700;
    }
    .feedback-modal p {
      margin: 0 0 18px 0;
      color: #666;
      font-size: 14px;
    }
    .feedback-modal textarea {
      width: 100%;
      height: 120px;
      border: 1px solid #eef0f2;
      background: #f8f9fa;
      border-radius: 12px;
      padding: 14px;
      resize: none;
      margin-bottom: 15px;
      font-family: inherit;
      font-size: 14px;
      transition: border-color 0.2s;
    }
    .feedback-modal textarea:focus {
      outline: none;
      border-color: #e83b3b;
      background: #fff;
    }
    .feedback-modal button {
      background: #1a1a1a;
      color: white;
      border: none;
      padding: 12px;
      border-radius: 10px;
      cursor: pointer;
      width: 100%;
      font-weight: 600;
      font-size: 15px;
      transition: all 0.2s;
    }
    .feedback-modal button:hover {
      background: #333;
      transform: translateY(-2px);
    }
    .feedback-modal .close-x {
      position: absolute;
      top: 15px;
      right: 15px;
      cursor: pointer;
      color: #aaa;
      font-size: 18px;
    }
  `;
  document.head.appendChild(style);

  const container = document.createElement('div');
  container.innerHTML = `
    <div class="feedback-btn" id="feedback-trigger" title="Send Feedback">💬</div>
    <div class="feedback-modal" id="feedback-modal">
      <span class="close-x" id="feedback-close">&times;</span>
      <h3>We'd love your help!</h3>
      <p>How can we make Foodopedia better for you?</p>
      <textarea id="feedback-text" placeholder="Share your suggestions..."></textarea>
      <button id="feedback-submit">Submit Feedback</button>
    </div>
  `;
  document.body.appendChild(container);

  const trigger = document.getElementById('feedback-trigger');
  const modal = document.getElementById('feedback-modal');
  const close = document.getElementById('feedback-close');
  const submit = document.getElementById('feedback-submit');
  const text = document.getElementById('feedback-text');

  trigger.onclick = (e) => {
    e.stopPropagation();
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
  };

  close.onclick = () => modal.style.display = 'none';

  submit.onclick = async () => {
    const val = text.value.trim();
    if (!val) return;

    submit.innerText = 'Sending...';
    submit.disabled = true;

    const userStr = sessionStorage.getItem(SESSION_KEY);
    const user = userStr ? JSON.parse(userStr) : { email: 'Guest', firstName: 'Guest', lastName: 'User' };
    const feedbackObj = {
      userId: user.email || user.mobile || 'Guest',
      userName: (user.firstName || '') + " " + (user.lastName || ''),
      message: val,
      timestamp: new Date().toLocaleString('en-GB', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', hour12:true })
    };

    // Always save to local storage
    let localFeedback = JSON.parse(localStorage.getItem('foodopedia_local_feedback') || '[]');
    localFeedback.push(feedbackObj);
    localStorage.setItem('foodopedia_local_feedback', JSON.stringify(localFeedback));

    // Also sync to Firestore if available
    try {
      await addDoc(collection(db, "feedback"), feedbackObj);
    } catch (err) {
      console.warn("Firestore feedback sync skipped:", err.message || err);
    }

    showToast("Feedback submitted", "success");
    text.value = '';
    modal.style.display = 'none';
    submit.innerText = 'Submit Feedback';
    submit.disabled = false;
  };

  document.addEventListener('click', (e) => {
    if (!modal.contains(e.target) && !trigger.contains(e.target)) {
      modal.style.display = 'none';
    }
  });
}

function updateNavbarAvatar() {
  const userStr = sessionStorage.getItem(SESSION_KEY);
  if (!userStr) return;
  const user = JSON.parse(userStr);
  
  const accountCircles = document.querySelectorAll('.account-circle');
  accountCircles.forEach(circle => {
    if (user.avatar) {
      circle.innerHTML = `<img src="${user.avatar}" alt="Profile" onerror="this.onerror=null; this.src='assets/images/default-avatar.png';">`;
    } else {
      circle.innerHTML = `<svg viewBox="0 0 24 24" width="22" height="22" stroke="white" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
    }
  });
}

function initAuth() {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  
  if (loginForm) {
    loginForm.addEventListener('submit', handleLoginRequest);
  }
  
  if (signupForm) {
    signupForm.addEventListener('submit', handleSignupRequest);
  }

  // Intro logic for auth.html
  const authContainer = document.getElementById('auth-container');
  const introGroup = document.getElementById('intro-text-group');
  
  if (introGroup && authContainer) {
    authContainer.style.opacity = '0';
    authContainer.style.pointerEvents = 'none';
    authContainer.style.transition = 'opacity 1s ease';
    introGroup.style.transition = 'opacity 1s ease';

    setTimeout(() => {
      introGroup.style.opacity = '0';
      setTimeout(() => {
        introGroup.style.display = 'none';
        authContainer.style.opacity = '1';
        authContainer.style.pointerEvents = 'all';
        authContainer.style.transform = 'translateY(0)';
      }, 1000);
    }, 5500);
  }

  // Admin visibility check on non-auth pages
  const userStr = sessionStorage.getItem(SESSION_KEY);
  const dlBtn = document.getElementById('download-data-btn');
  const dlFeedbackBtn = document.getElementById('download-feedback-btn');

  if (userStr) {
    const user = JSON.parse(userStr);
    if (user.email === 'admin@foodopedia.com' || user.mobile === 'admin') {
      if (!user.avatar) {
        user.avatar = 'assets/images/avatars/avatar1.png';
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
      }
      if (dlBtn) dlBtn.style.display = 'inline-block';
      if (dlFeedbackBtn) dlFeedbackBtn.style.display = 'inline-block';
    } else {
      if (dlBtn) dlBtn.style.display = 'none';
      if (dlFeedbackBtn) dlFeedbackBtn.style.display = 'none';
    }
  }

  // Populate navbar profile avatar
  updateNavbarAvatar();

  // Always update like count on protected pages
  updateLikeCount();

  // Inject feedback system
  injectFeedbackSystem();
}

function updatePrefix() {
  const countryInput = document.getElementById('signup-country').value;
  const list = document.getElementById('country-list');
  if (!list) return;
  const options = list.options;
  let prefix = "";
  for (let i = 0; i < options.length; i++) {
    if (options[i].value === countryInput) {
      prefix = options[i].getAttribute('data-prefix');
      break;
    }
  }
  
  document.getElementById('signup-prefix').value = prefix || '';
}

async function handleLoginRequest(e) {
  e.preventDefault();
  const identifier = document.getElementById('login-identifier').value.trim();
  const password = document.getElementById('login-password').value.trim();
  if (!identifier || !password) return;

  const loginBtn = e.target.querySelector('button[type="submit"]');
  if (loginBtn) {
    loginBtn.innerText = "Logging in...";
    loginBtn.disabled = true;
  }

  const resetBtn = () => {
    if (loginBtn) {
      loginBtn.innerText = "Login";
      loginBtn.disabled = false;
    }
  };

  // Check built-in admin credentials instantly (0ms)
  if ((identifier === 'admin@foodopedia.com' || identifier === 'admin') && password === 'admin123') {
    const adminUser = {
      firstName: "Admin",
      lastName: "User",
      email: "admin@foodopedia.com",
      mobile: "admin",
      country: "Global",
      avatar: "assets/images/avatars/avatar1.png"
    };
    showToast("Login successful! Welcome Admin.", "success");
    loginUser(adminUser);
    return;
  }

  // 1. Instant check in Local Storage (0ms)
  let localUsers = JSON.parse(localStorage.getItem('foodopedia_local_users') || '[]');
  let foundUser = localUsers.find(u => (u.email === identifier || u.mobile === identifier) && u.password === password);

  if (foundUser) {
    showToast("Login successful!", "success");
    loginUser(foundUser);
    return;
  }

  // 2. If not found locally, query Firebase Firestore with a 2-second max timeout
  try {
    const fetchWithTimeout = (promise, ms = 2000) => {
      return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms))
      ]);
    };

    const usersRef = collection(db, "users");
    let q = query(usersRef, where("email", "==", identifier), where("password", "==", password));
    let querySnapshot = await fetchWithTimeout(getDocs(q), 2000);
    
    if (querySnapshot.empty) {
      q = query(usersRef, where("mobile", "==", identifier), where("password", "==", password));
      querySnapshot = await fetchWithTimeout(getDocs(q), 2000);
    }
    
    if (!querySnapshot.empty) {
      foundUser = querySnapshot.docs[0].data();
      // Cache user locally for instant future logins
      if (!localUsers.some(u => u.email === foundUser.email || u.mobile === foundUser.mobile)) {
        localUsers.push(foundUser);
        localStorage.setItem('foodopedia_local_users', JSON.stringify(localUsers));
      }
    }
  } catch (err) {
    console.warn("Firestore query skipped or timed out:", err.message || err);
  }

  // 3. Final Check & Response
  if (foundUser) {
    showToast("Login successful!", "success");
    loginUser(foundUser);
  } else {
    showToast("Account not found. Please Sign Up first!", "error");
    resetBtn();
    setTimeout(() => {
      if (typeof switchMode === 'function') switchMode('signup');
    }, 1500);
  }
}

async function handleSignupRequest(e) {
  e.preventDefault();
  
  const firstName = document.getElementById('signup-firstname').value.trim();
  const lastName = document.getElementById('signup-lastname').value.trim();
  const country = document.getElementById('signup-country').value.trim();
  const mobile = document.getElementById('signup-mobile').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value.trim();
  const source = document.getElementById('signup-source').value;
  
  if (!firstName || !lastName || !country || !mobile || !email || !password) {
    showToast("Please fill all mandatory fields.", "error");
    return;
  }

  const signupBtn = e.target.querySelector('button[type="submit"]');
  if (signupBtn) {
    signupBtn.innerText = "Creating Account...";
    signupBtn.disabled = true;
  }

  let localUsers = JSON.parse(localStorage.getItem('foodopedia_local_users') || '[]');
  
  // Check if account already exists locally
  if (localUsers.some(u => u.email === email || u.mobile === mobile)) {
    showToast("An account with this email/mobile already exists. Please login.", "error");
    if (signupBtn) {
      signupBtn.innerText = "Sign Up";
      signupBtn.disabled = false;
    }
    switchMode('login');
    return;
  }

  const newUser = {
    firstName, lastName, country, mobile, email, password, source,
    createdAt: new Date().toLocaleString('en-GB', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', hour12:true })
  };

  // Save locally first for instant login
  localUsers.push(newUser);
  localStorage.setItem('foodopedia_local_users', JSON.stringify(localUsers));

  // Sync to Firebase asynchronously in background without blocking UI
  const usersRef = collection(db, "users");
  addDoc(usersRef, newUser).catch(err => {
    console.warn("Background Firestore sync skipped:", err.message || err);
  });

  showToast("Account created successfully!", "success");
  loginUser(newUser);
}

function loginUser(user) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  window.location.href = 'index.html';
}

function switchMode(mode) {
  const loginSection = document.getElementById('login-section');
  const signupSection = document.getElementById('signup-section');
  const formContainer = document.getElementById('form-container');

  formContainer.style.display = 'block';

  if (mode === 'login') {
    loginSection.style.display = 'block';
    signupSection.style.display = 'none';
  } else {
    loginSection.style.display = 'none';
    signupSection.style.display = 'block';
  }
}

function showToast(message, type) {
  const toast = document.createElement('div');
  toast.className = `auth-toast ${type}`;
  toast.innerText = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 500);
  }, 4000);
}

async function downloadUserData() {
  const usersMap = new Map();
  
  // 1. Add local users first
  const localUsers = JSON.parse(localStorage.getItem('foodopedia_local_users') || '[]');
  localUsers.forEach(u => {
    const key = u.email || u.mobile;
    if (key) usersMap.set(key, u);
  });

  // 2. Fetch Firestore users if reachable
  try {
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(usersRef);
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const key = data.email || data.mobile;
      if (key) usersMap.set(key, data);
    });
  } catch (err) {
    console.warn("Firestore download user data skipped:", err.message || err);
  }

  const users = Array.from(usersMap.values());
  const usersText = JSON.stringify(users, null, 2);
  const blob = new Blob([usersText], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'foodopedia_users.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function downloadFeedbackData() {
  const feedbackList = [];
  
  // 1. Add local feedback first
  const localFeedback = JSON.parse(localStorage.getItem('foodopedia_local_feedback') || '[]');
  feedbackList.push(...localFeedback);

  // 2. Fetch Firestore feedback if reachable
  try {
    const feedbackRef = collection(db, "feedback");
    const querySnapshot = await getDocs(feedbackRef);
    querySnapshot.forEach((doc) => {
      feedbackList.push(doc.data());
    });
  } catch (err) {
    console.warn("Firestore download feedback skipped:", err.message || err);
  }

  const feedbackText = JSON.stringify(feedbackList, null, 2);
  const blob = new Blob([feedbackText], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'foodopedia_feedback.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Route Protection logic
function protectRoute() {
  const user = sessionStorage.getItem(SESSION_KEY);
  if (!user && !window.location.href.includes('auth.html')) {
    window.location.href = 'auth.html';
  }
}

function logoutUser() {
  sessionStorage.removeItem(SESSION_KEY);
  window.location.href = 'auth.html';
}

// Expose globally
window.protectRoute = protectRoute;
window.logoutUser = logoutUser;
window.downloadUserData = downloadUserData;
window.downloadFeedbackData = downloadFeedbackData;
window.updatePrefix = updatePrefix;
window.switchMode = switchMode;
window.toggleLike = toggleLike;
window.updateLikeCount = updateLikeCount;
window.getLikedFoods = getLikedFoods;
window.getImagePath = getImagePath;
window.getTypeIcon = getTypeIcon;
window.updateNavbarAvatar = updateNavbarAvatar;

document.addEventListener('DOMContentLoaded', initAuth);

// Ensure navbar avatar & likes refresh when returning to page via Back button or tab switch
window.addEventListener('pageshow', () => {
  updateNavbarAvatar();
  updateLikeCount();
});

window.addEventListener('focus', () => {
  updateNavbarAvatar();
  updateLikeCount();
});

window.addEventListener('storage', () => {
  updateNavbarAvatar();
  updateLikeCount();
});

// Run route protection automatically
protectRoute();
