// main.js — Application logic for index.html (DataStore Auth)

(function () {
  'use strict';

  function handleLogout(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      sessionStorage.removeItem('catalyst_user');
      localStorage.removeItem('catalyst_user');
    } catch (err) {}
    window.location.replace('login.html');
  }

  // Check auth session
  var raw = null;
  try {
    raw = sessionStorage.getItem('catalyst_user');
  } catch (err) {}

  if (!raw) {
    window.location.replace('login.html');
    return;
  }

  try {
    var user = JSON.parse(raw);

    // Show user display name
    var welcomeMsg = document.getElementById('welcomeMsg');
    if (welcomeMsg) {
      welcomeMsg.textContent = 'Welcome, ' + (user.name || user.email || 'User');
    }

    // Display the app
    var appEl = document.getElementById('app');
    if (appEl) {
      appEl.style.display = 'block';
    }

    // Attach click and touch listeners to logout button
    var logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.onclick = handleLogout;
      logoutBtn.addEventListener('click', handleLogout);
    }
  } catch (e) {
    handleLogout();
  }
})();
