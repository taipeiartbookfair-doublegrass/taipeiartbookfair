const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");

const lengthRule = document.getElementById("length-rule");
const uppercaseRule = document.getElementById("uppercase-rule");
const lowercaseRule = document.getElementById("lowercase-rule");
const numberRule = document.getElementById("number-rule");

passwordInput.addEventListener("input", function () {
  const value = passwordInput.value;

  if (value.length >= 8) {
    lengthRule.textContent = "✓ At least 8 characters";
    lengthRule.style.color = "darkgreen";
  } else {
    lengthRule.textContent = "✕ At least 8 characters";
    lengthRule.style.color = "plum";
  }

  if (/[A-Z]/.test(value)) {
    uppercaseRule.textContent = "✓ At least one uppercase letter";
    uppercaseRule.style.color = "darkgreen";
  } else {
    uppercaseRule.textContent = "✕ At least one uppercase letter";
    uppercaseRule.style.color = "plum";
  }

  if (/[a-z]/.test(value)) {
    lowercaseRule.textContent = "✓ At least one lowercase letter";
    lowercaseRule.style.color = "darkgreen";
  } else {
    lowercaseRule.textContent = "✕ At least one lowercase letter";
    lowercaseRule.style.color = "plum";
  }

  if (/[0-9]/.test(value)) {
    numberRule.textContent = "✓ At least one number";
    numberRule.style.color = "darkgreen";
  } else {
    numberRule.textContent = "✕ At least one number";
    numberRule.style.color = "plum";
  }
});

togglePassword.addEventListener("click", function () {
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    togglePassword.textContent = "Hide";
  } else {
    passwordInput.type = "password";
    togglePassword.textContent = "Show";
  }
});
