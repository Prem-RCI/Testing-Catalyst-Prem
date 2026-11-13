// login.js — Handles authentication against test_table via test_project_function

(function () {
  'use strict';

  var form = document.getElementById('loginForm');
  var emailInput = document.getElementById('email');
  var passwordInput = document.getElementById('password');
  var emailError = document.getElementById('emailError');
  var passwordError = document.getElementById('passwordError');
  var generalError = document.getElementById('generalError');
  var generalSuccess = document.getElementById('generalSuccess');
  var submitBtn = document.getElementById('submitBtn');
  var btnText = document.getElementById('btnText');
  var togglePwd = document.getElementById('togglePassword');

  // If already logged in, redirect to index.html
  if (sessionStorage.getItem('catalyst_user')) {
    window.location.replace('index.html');
    return;
  }

  // Show / Hide password toggle
  if (togglePwd && passwordInput) {
    togglePwd.addEventListener('click', function () {
      var isPwd = passwordInput.type === 'password';
      passwordInput.type = isPwd ? 'text' : 'password';
      togglePwd.textContent = isPwd ? '🙈' : '👁';
    });
  }

  function showError(el, msg) {
    if (el) {
      el.textContent = msg;
      el.style.display = 'block';
    }
  }

  function clearError(el) {
    if (el) {
      el.textContent = '';
      el.style.display = 'none';
    }
  }

  function validate() {
    var valid = true;
    clearError(emailError);
    clearError(passwordError);
    clearError(generalError);
    clearError(generalSuccess);

    var email = emailInput.value.trim();
    var password = passwordInput.value;

    if (!email) {
      showError(emailError, 'Email is required');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError(emailError, 'Please enter a valid email address');
      valid = false;
    }

    if (!password) {
      showError(passwordError, 'Password is required');
      valid = false;
    }

    return valid;
  }

  // Clear errors on typing
  emailInput.addEventListener('input', function () { clearError(emailError); clearError(generalError); });
  passwordInput.addEventListener('input', function () { clearError(passwordError); clearError(generalError); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) return;

    submitBtn.disabled = true;
    btnText.textContent = 'Verifying...';

    var payload = {
      email: emailInput.value.trim(),
      password: passwordInput.value
    };

    // Send credentials to test_project_function
    fetch('/server/test_project_function/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        return res.text();
      })
      .then(function (rawText) {
        submitBtn.disabled = false;
        btnText.textContent = 'Sign In';

        var data;
        try {
          var parsed = JSON.parse(rawText);
          // Catalyst BasicIO local runner wraps the response in { output: "..." }
          if (parsed && typeof parsed.output === 'string') {
            try {
              data = JSON.parse(parsed.output);
            } catch (ex) {
              data = parsed;
            }
          } else {
            data = parsed;
          }
        } catch (ex) {
          throw new Error('Invalid response from server.');
        }

        if (data.status === 'success' && data.user) {
          // Save authenticated user profile in sessionStorage
          sessionStorage.setItem('catalyst_user', JSON.stringify(data.user));
          showError(generalSuccess, 'Login successful! Redirecting...');
          setTimeout(function () {
            window.location.replace('index.html');
          }, 600);
        } else {
          showError(generalError, data.message || 'Invalid email or password.');
        }
      })
      .catch(function (err) {
        submitBtn.disabled = false;
        btnText.textContent = 'Sign In';
        showError(generalError, err.message || 'Network error occurred. Please try again.');
      });
  });
})();
