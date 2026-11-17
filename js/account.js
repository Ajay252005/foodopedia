import { db } from './firebase-config.js';
import { collection, query, where, getDocs, updateDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const SESSION_KEY = 'foodopedia_current_user';

function showAccountToast(message, type) {
  const toast = document.createElement('div');
  toast.className = `auth-toast ${type}`;
  toast.innerText = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 500);
  }, 4000);
}

document.addEventListener('DOMContentLoaded', () => {
  const userStr = sessionStorage.getItem(SESSION_KEY);
  if (!userStr) {
    window.location.href = 'auth.html';
    return;
  }

  const user = JSON.parse(userStr);
  
  const inputs = {
    firstName: document.getElementById('acc-firstname'),
    lastName: document.getElementById('acc-lastname'),
    email: document.getElementById('acc-email'),
    mobile: document.getElementById('acc-mobile'),
    country: document.getElementById('acc-country')
  };

  // Populate country list if available
  const populateCountries = () => {
    if (window.countries && inputs.country) {
      inputs.country.innerHTML = '<option value="">Select Country</option>' + window.countries.map(c => 
        `<option value="${c.name}">${c.name}</option>`
      ).join('');
      inputs.country.value = user.country || '';
    }
  };

  populateCountries();

  // Populate other fields
  inputs.firstName.value = user.firstName || '';
  inputs.lastName.value = user.lastName || '';
  inputs.email.value = user.email || '';
  inputs.mobile.value = user.mobile || '';

  // --- AVATAR LOGIC ---
  const userAvatar = document.getElementById('user-avatar');
  const avatarModal = document.getElementById('avatar-modal');
  const avatarEditBtn = document.getElementById('avatar-edit-trigger');
  const closeModalBtn = document.getElementById('close-avatar-modal');
  const avatarGrid = document.getElementById('avatar-options-grid');
  const avatarContainer = document.querySelector('.avatar-section');

  // Load initial avatar into main profile image & navbar
  if (user.avatar) {
    userAvatar.src = user.avatar;
  } else if (user.email === 'admin@foodopedia.com' || user.mobile === 'admin') {
    user.avatar = 'assets/images/avatars/avatar1.png';
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    userAvatar.src = user.avatar;
  }

  // Populate avatars (10 items)
  const avatarList = [];
  for (let i = 1; i <= 10; i++) {
    avatarList.push(`assets/images/avatars/avatar${i}.png`);
  }

  avatarGrid.innerHTML = avatarList.map(src => 
    `<img src="${src}" class="avatar-option ${user.avatar === src ? 'selected' : ''}" data-src="${src}">`
  ).join('');

  // Open Modal function (only when in edit mode)
  const openAvatarModal = (e) => {
    if (avatarEditBtn && (avatarEditBtn.style.display === 'flex' || !inputs.firstName.disabled)) {
      if (e) e.stopPropagation();
      if (avatarModal) avatarModal.style.display = 'block';
    }
  };

  // Open modal when clicking edit button OR avatar circle while editing
  if (avatarEditBtn) avatarEditBtn.onclick = openAvatarModal;
  if (avatarContainer) avatarContainer.onclick = openAvatarModal;

  // Close Modal
  if (closeModalBtn) {
    closeModalBtn.onclick = (e) => {
      e.stopPropagation();
      avatarModal.style.display = 'none';
    };
  }

  // Close modal when clicking outside backdrop
  window.addEventListener('click', (e) => {
    if (e.target === avatarModal) {
      avatarModal.style.display = 'none';
    }
  });

  // Selection Logic
  avatarGrid.onclick = async (e) => {
    e.stopPropagation();
    if (e.target.classList.contains('avatar-option')) {
      const newAvatar = e.target.getAttribute('data-src');
      
      // Update local session & local users list IMMEDIATELY
      user.avatar = newAvatar;
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));

      let localUsers = JSON.parse(localStorage.getItem('foodopedia_local_users') || '[]');
      const localIdx = localUsers.findIndex(u => (user.email && u.email === user.email) || (user.mobile && u.mobile === user.mobile));
      if (localIdx !== -1) {
        localUsers[localIdx].avatar = newAvatar;
        localStorage.setItem('foodopedia_local_users', JSON.stringify(localUsers));
      }

      // Update main avatar & navbar icon instantly
      userAvatar.src = newAvatar;
      if (typeof window.updateNavbarAvatar === 'function') {
        window.updateNavbarAvatar();
      }

      showAccountToast("Avatar updated!", "success");

      // Update selection highlight
      document.querySelectorAll('.avatar-option').forEach(opt => opt.classList.remove('selected'));
      e.target.classList.add('selected');
      
      // Close modal
      setTimeout(() => {
        avatarModal.style.display = 'none';
      }, 250);

      // Async sync to Firestore in background
      try {
        const usersRef = collection(db, "users");
        let q = user.email ? 
          query(usersRef, where("email", "==", user.email)) : 
          query(usersRef, where("mobile", "==", user.mobile));
        
        let querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const userDocId = querySnapshot.docs[0].id;
          await updateDoc(doc(db, "users", userDocId), { avatar: newAvatar });
        }
      } catch (err) {
        console.warn("Firestore avatar sync skipped:", err.message || err);
      }
    }
  };
  const editBtn = document.getElementById('edit-btn');
  const saveBtn = document.getElementById('save-btn');
  const accountForm = document.getElementById('account-form');
  
  const deleteTriggerBtn = document.getElementById('delete-trigger-btn');
  const deleteConfirmSection = document.getElementById('delete-confirm-section');
  const deletePasswordInput = document.getElementById('delete-password-confirm');
  const deleteFinalBtn = document.getElementById('delete-final-btn');

  // EDIT TOGGLE
  editBtn.onclick = () => {
    inputs.firstName.disabled = false;
    inputs.lastName.disabled = false;
    inputs.country.disabled = false;
    
    if (avatarEditBtn) avatarEditBtn.style.display = 'flex';
    editBtn.style.display = 'none';
    saveBtn.style.display = 'block';
  };

  // SAVE CHANGES
  accountForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    saveBtn.innerText = 'Saving...';
    saveBtn.disabled = true;

    const updates = {
      firstName: inputs.firstName.value.trim(),
      lastName: inputs.lastName.value.trim(),
      country: inputs.country.value.trim()
    };

    // Update session storage and local users
    Object.assign(user, updates);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));

    let localUsers = JSON.parse(localStorage.getItem('foodopedia_local_users') || '[]');
    const localIdx = localUsers.findIndex(u => (user.email && u.email === user.email) || (user.mobile && u.mobile === user.mobile));
    if (localIdx !== -1) {
      Object.assign(localUsers[localIdx], updates);
      localStorage.setItem('foodopedia_local_users', JSON.stringify(localUsers));
    }

    try {
      const usersRef = collection(db, "users");
      let q = user.email ? 
        query(usersRef, where("email", "==", user.email)) : 
        query(usersRef, where("mobile", "==", user.mobile));
      
      let querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDocId = querySnapshot.docs[0].id;
        const userDocRef = doc(db, "users", userDocId);
        await updateDoc(userDocRef, updates);
      }
    } catch (err) {
      console.warn("Firestore profile update sync skipped:", err.message || err);
    } finally {
      showAccountToast("Profile updated successfully!", "success");
      
      // Re-lock fields
      inputs.firstName.disabled = true;
      inputs.lastName.disabled = true;
      inputs.country.disabled = true;
      
      if (avatarEditBtn) avatarEditBtn.style.display = 'none';
      editBtn.style.display = 'block';
      saveBtn.style.display = 'none';
      saveBtn.innerText = 'Save Changes';
      saveBtn.disabled = false;
    }
  });

  // DELETE FLOW
  deleteTriggerBtn.onclick = () => {
    deleteConfirmSection.style.display = 
      deleteConfirmSection.style.display === 'block' ? 'none' : 'block';
    
    if (deleteConfirmSection.style.display === 'block') {
      deletePasswordInput.focus();
    }
  };

  deleteFinalBtn.onclick = async () => {
    const enteredPassword = deletePasswordInput.value;
    
    if (!enteredPassword) {
      showAccountToast("Please enter your password.", "error");
      return;
    }

    if (enteredPassword !== user.password) {
      showAccountToast("Incorrect password. Deletion cancelled.", "error");
      return;
    }

    const doubleConfirm = confirm("FINAL WARNING: All your data will be permanently removed. Proceed?");
    if (!doubleConfirm) return;

    deleteFinalBtn.innerText = 'Deleting...';
    deleteFinalBtn.disabled = true;

    // Delete from Firestore
    try {
      const usersRef = collection(db, "users");
      let q = user.email ? 
        query(usersRef, where("email", "==", user.email)) : 
        query(usersRef, where("mobile", "==", user.mobile));
      
      let querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDocId = querySnapshot.docs[0].id;
        await deleteDoc(doc(db, "users", userDocId));
      }
    } catch (err) {
      console.warn("Firestore deletion sync skipped:", err.message || err);
    }

    // Delete from local storage & session
    let localUsers = JSON.parse(localStorage.getItem('foodopedia_local_users') || '[]');
    localUsers = localUsers.filter(u => u.email !== user.email && u.mobile !== user.mobile);
    localStorage.setItem('foodopedia_local_users', JSON.stringify(localUsers));

    sessionStorage.removeItem(SESSION_KEY);
    alert("Account deleted successfully.");
    window.location.href = 'auth.html';
  };
});
