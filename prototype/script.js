/**
 * MediTrack Patient Portal - Prototype Interactive Script
 * Handles client-side form validation, password visibility toggles,
 * real-time requirement indicators, and privacy-focused simulated feedback.
 */

document.addEventListener('DOMContentLoaded', () => {
  initPasswordToggles();
  initLoginValidation();
  initRegisterValidation();
  initForgotPasswordValidation();
});

/**
 * Password Visibility Toggle
 */
function initPasswordToggles() {
  const toggleButtons = document.querySelectorAll('.btn-toggle-password');

  toggleButtons.forEach(button => {
    button.addEventListener('click', () => {
      const wrapper = button.closest('.form-control-wrapper');
      if (!wrapper) return;

      const input = wrapper.querySelector('input[type="password"], input[type="text"]');
      if (!input) return;

      const isPassword = input.getAttribute('type') === 'password';
      input.setAttribute('type', isPassword ? 'text' : 'password');

      button.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
      button.querySelector('span').textContent = isPassword ? '🙈 Hide' : '👁 Show';
    });
  });
}

/**
 * Simple Email Regex Helper
 */
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

/**
 * Display Top Alert Banner
 */
function showAlert(containerId, type, message) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const iconMap = {
    danger: '⚠',
    success: '✓',
    info: 'ℹ'
  };

  container.innerHTML = `
    <div class="alert alert-${type}" role="alert">
      <span class="alert-icon" aria-hidden="true">${iconMap[type] || 'ℹ'}</span>
      <div>${message}</div>
    </div>
  `;
}

function clearAlert(containerId) {
  const container = document.getElementById(containerId);
  if (container) container.innerHTML = '';
}

/**
 * Patient Sign-In Form Validation & Simulation
 */
function initLoginValidation() {
  const form = document.getElementById('login-form');
  if (!form) return;

  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');

  // Clear invalid styling on blur or input
  [emailInput, passwordInput].forEach(input => {
    if (!input) return;
    input.addEventListener('input', () => {
      input.classList.remove('is-invalid');
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearAlert('alert-container');

    let isValid = true;

    if (!emailInput.value.trim() || !isValidEmail(emailInput.value.trim())) {
      emailInput.classList.add('is-invalid');
      isValid = false;
    } else {
      emailInput.classList.remove('is-invalid');
    }

    if (!passwordInput.value) {
      passwordInput.classList.add('is-invalid');
      isValid = false;
    } else {
      passwordInput.classList.remove('is-invalid');
    }

    if (!isValid) {
      showAlert('alert-container', 'danger', 'Please fix the highlighted errors below before signing in.');
      return;
    }

    // Simulate login button submit loading state
    const submitBtn = document.getElementById('submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Verifying Credentials...';

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;

      // Simulated success outcome
      showAlert('alert-container', 'success', `<strong>Success:</strong> Authentication simulated successfully for ${escapeHTML(emailInput.value.trim())}. In the full application, you will be redirected to your Patient Portal Dashboard.`);
      form.reset();
    }, 1000);
  });
}

/**
 * Patient Account Registration Form Validation & Simulation
 */
function initRegisterValidation() {
  const form = document.getElementById('register-form');
  if (!form) return;

  const fullnameInput = document.getElementById('fullname');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirm-password');
  const consentInput = document.getElementById('consent');

  // Real-time password requirement updates
  const reqLength = document.getElementById('req-length');
  const reqNumber = document.getElementById('req-number');
  const reqSymbol = document.getElementById('req-symbol');

  if (passwordInput && reqLength) {
    passwordInput.addEventListener('input', () => {
      const val = passwordInput.value;

      // Length >= 8
      if (val.length >= 8) {
        reqLength.classList.remove('invalid');
        reqLength.classList.add('valid');
      } else {
        reqLength.classList.remove('valid');
        reqLength.classList.add('invalid');
      }

      // Contains digit
      if (/\d/.test(val)) {
        reqNumber.classList.remove('invalid');
        reqNumber.classList.add('valid');
      } else {
        reqNumber.classList.remove('valid');
        reqNumber.classList.add('invalid');
      }

      // Contains special symbol
      if (/[!@#$%^&*(),.?":{}|<>]/.test(val)) {
        reqSymbol.classList.remove('invalid');
        reqSymbol.classList.add('valid');
      } else {
        reqSymbol.classList.remove('valid');
        reqSymbol.classList.add('invalid');
      }
    });
  }

  // Clear field errors on input
  [fullnameInput, emailInput, passwordInput, confirmPasswordInput, consentInput].forEach(input => {
    if (!input) return;
    input.addEventListener('input', () => {
      input.classList.remove('is-invalid');
    });
    if (input.type === 'checkbox') {
      input.addEventListener('change', () => {
        input.classList.remove('is-invalid');
      });
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearAlert('alert-container');

    let isValid = true;

    // Full name check
    if (!fullnameInput.value.trim()) {
      fullnameInput.classList.add('is-invalid');
      isValid = false;
    } else {
      fullnameInput.classList.remove('is-invalid');
    }

    // Email check
    if (!emailInput.value.trim() || !isValidEmail(emailInput.value.trim())) {
      emailInput.classList.add('is-invalid');
      isValid = false;
    } else {
      emailInput.classList.remove('is-invalid');
    }

    // Password requirements check
    const passVal = passwordInput.value;
    const isPassValid = passVal.length >= 8 && /\d/.test(passVal) && /[!@#$%^&*(),.?":{}|<>]/.test(passVal);
    if (!isPassValid) {
      passwordInput.classList.add('is-invalid');
      isValid = false;
    } else {
      passwordInput.classList.remove('is-invalid');
    }

    // Confirm password check
    if (!confirmPasswordInput.value || confirmPasswordInput.value !== passVal) {
      confirmPasswordInput.classList.add('is-invalid');
      isValid = false;
    } else {
      confirmPasswordInput.classList.remove('is-invalid');
    }

    // Consent check
    if (!consentInput.checked) {
      consentInput.classList.add('is-invalid');
      isValid = false;
    } else {
      consentInput.classList.remove('is-invalid');
    }

    if (!isValid) {
      showAlert('alert-container', 'danger', 'Please review and correct the errors below before submitting your registration.');
      return;
    }

    // Simulate submission state
    const submitBtn = document.getElementById('submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating Patient Account...';

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;

      showAlert('alert-container', 'success', `<strong>Account Created!</strong> Simulated registration completed for ${escapeHTML(fullnameInput.value.trim())}. You can now <a href="index.html" class="link">Sign In to your account</a>.`);
      form.reset();

      // Reset requirement check visual states
      [reqLength, reqNumber, reqSymbol].forEach(el => {
        if (el) {
          el.classList.remove('valid');
          el.classList.add('invalid');
        }
      });
    }, 1200);
  });
}

/**
 * Password Recovery Form Validation & Non-Enumerating Simulation
 */
function initForgotPasswordValidation() {
  const form = document.getElementById('forgot-password-form');
  if (!form) return;

  const emailInput = document.getElementById('email');
  const confirmationBox = document.getElementById('confirmation-box');
  const confirmedEmailSpan = document.getElementById('confirmed-email');

  if (emailInput) {
    emailInput.addEventListener('input', () => {
      emailInput.classList.remove('is-invalid');
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearAlert('alert-container');
    if (confirmationBox) confirmationBox.style.display = 'none';

    if (!emailInput.value.trim() || !isValidEmail(emailInput.value.trim())) {
      emailInput.classList.add('is-invalid');
      showAlert('alert-container', 'danger', 'Please enter a valid email address to request password recovery.');
      return;
    }

    emailInput.classList.remove('is-invalid');

    const submitBtn = document.getElementById('submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;

      // Privacy-safe generic confirmation message
      if (confirmedEmailSpan) {
        confirmedEmailSpan.textContent = emailInput.value.trim();
      }
      if (confirmationBox) {
        confirmationBox.style.display = 'flex';
      }

      form.reset();
    }, 1000);
  });
}

/**
 * Utility: HTML Escape String
 */
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g,
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}
