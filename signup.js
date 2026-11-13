// signup.js — User registration against test_table in Catalyst Data Store

(function () {
  'use strict';

  var form = document.getElementById('signupForm');
  var nameInput = document.getElementById('name');
  var emailInput = document.getElementById('email');
  var passwordInput = document.getElementById('password');
  var confirmPasswordInput = document.getElementById('confirmPassword');

  var nameError = document.getElementById('nameError');
  var emailError = document.getElementById('emailError');
  var passwordError = document.getElementById('passwordError');
  var confirmPasswordError = document.getElementById('confirmPasswordError');
  var generalError = document.getElementById('generalError');
  var generalSuccess = document.getElementById('generalSuccess');

  var submitBtn = document.getElementById('submitBtn');
  var btnText = document.getElementById('btnText');
  var togglePwd = document.getElementById('togglePassword');

  // Toggle password visibility
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
    clearError(nameError);
    clearError(emailError);
    clearError(passwordError);
    clearError(confirmPasswordError);
    clearError(generalError);
    clearError(generalSuccess);

    var name = nameInput.value.trim();
    var email = emailInput.value.trim();
    var password = passwordInput.value;
    var confirmPassword = confirmPasswordInput.value;

    if (!name) {
      showError(nameError, 'Full name is required');
      valid = false;
    }

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
    } else if (password.length < 6) {
      showError(passwordError, 'Password must be at least 6 characters');
      valid = false;
    }

    if (password !== confirmPassword) {
      showError(confirmPasswordError, 'Passwords do not match');
      valid = false;
    }

    return valid;
  }

  // Clear errors on typing
  nameInput.addEventListener('input', function () { clearError(nameError); clearError(generalError); });
  emailInput.addEventListener('input', function () { clearError(emailError); clearError(generalError); });
  passwordInput.addEventListener('input', function () { clearError(passwordError); clearError(generalError); });
  confirmPasswordInput.addEventListener('input', function () { clearError(confirmPasswordError); clearError(generalError); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) return;

    submitBtn.disabled = true;
    btnText.textContent = 'Creating Account...';

    var payload = {
      action: 'register',
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      password: passwordInput.value
    };

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
        btnText.textContent = 'Sign Up';

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

        if (data.status === 'success') {
          showError(generalSuccess, 'Account created successfully! Redirecting to login...');
          setTimeout(function () {
            window.location.replace('login.html');
          }, 1200);
        } else {
          showError(generalError, data.message || 'Registration failed.');
        }
      })
      .catch(function (err) {
        submitBtn.disabled = false;
        btnText.textContent = 'Sign Up';
        showError(generalError, err.message || 'Network error occurred. Please try again.');
      });
  });
})();
