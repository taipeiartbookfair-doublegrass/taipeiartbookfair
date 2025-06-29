/**
 * 忘記密碼功能主程式
 * 支援兩種模式：
 * 1. 使用 HTML 中現有的表單結構
 * 2. 動態生成多步驟表單

 */
document.addEventListener("DOMContentLoaded", function () {
  // Google Apps Script API 端點
  const apiUrl =
    "https://script.google.com/macros/s/AKfycbwNWgPsLK_ldHUIvoIg5a9k3PNIlmjvJeTgbCZ5CZsvKFQ7e1DoxbMsAawi4nI3Rea4DA/exec";

  // 檢查是否已經有 HTML 中的元素存在，如果有就使用現有的結構
  const existingSendButton = document.getElementById("send-verification-btn");
  // 注意：verify-btn 已在HTML中註解掉，所以不再檢查它

  if (existingSendButton) {
    // 使用現有的 HTML 結構 (適用於 forgotpassword.html)
    initializeExistingStructure();
  }

  /**
   * 初始化現有 HTML 結構的事件處理器
   * 使用 forgotpassword.html 中已經存在的表單元素
   */
  function initializeExistingStructure() {
    // 獲取頁面中的關鍵元素
    const sendVerificationButton = document.getElementById(
      "send-verification-btn"
    );
    // 注意：以下元素已在HTML中註解掉，所以不再使用
    // const verificationCodeInput = document.getElementById("verification-code");
    // const codeBox = document.getElementById("code-box");
    // const verifyButton = document.getElementById("verify-btn");
    // const verifyBox = document.getElementById("verify-box");
    let userEmail = ""; // 儲存用戶輸入的電子郵件

    // 步驟 1: 發送驗證碼按鈕的事件處理器
    sendVerificationButton.addEventListener("click", async function (event) {
      event.preventDefault();

      // 從表單中獲取電子郵件
      const email = document.querySelector('input[name="email"]').value.trim();

      // 驗證電子郵件是否為空
      if (!email) {
        alert("請輸入您的電子郵件 Please enter your email");
        return;
      }

      // 驗證電子郵件格式
      if (!isValidEmail(email)) {
        alert("請輸入有效的電子郵件格式 Please enter a valid email format");
        return;
      }

      userEmail = email; // 保存電子郵件以供後續使用

      try {
        // 顯示載入狀態
        sendVerificationButton.disabled = true;
        sendVerificationButton.textContent = "發送中... Sending...";

        // 發送驗證碼
        const params = new URLSearchParams({
          action: "forgot_password_send_email",
          account: email,
        }).toString();

        const response = await fetch(apiUrl, {
          redirect: "follow",
          method: "POST",
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
          },
          body: params,
        });

        const data = await response.json();

        if (data.success) {
          alert(
            "驗證碼已發送至您的電子郵件 Verification code sent to your email"
          );

          // 直接創建密碼重設表單
          createPasswordResetForm(userEmail);
        } else {
          alert(
            data.message ||
              "發送驗證碼失敗，請稍後再試 Failed to send verification code, please try again later"
          );
        }
      } catch (error) {
        alert("網絡錯誤，請稍後再試 Network error, please try again later");
        console.error("Send verification error:", error);
      } finally {
        // 恢復按鈕狀態
        sendVerificationButton.disabled = false;
        sendVerificationButton.textContent =
          "發送驗證碼 Send Verification Code";
      }
    });

    // 步驟 2: 原本的驗證按鈕邏輯已移除，因為現在驗證碼和密碼重設合併為一個步驟
    // verifyButton.addEventListener("click", function (event) {
    //   event.preventDefault();
    //   const enteredCode = verificationCodeInput.value.trim();
    //   if (!enteredCode) {
    //     alert("請輸入驗證碼 Please enter verification code");
    //     return;
    //   }
    //   createPasswordResetForm(userEmail, enteredCode);
    // });
  }

  /**
   * 創建密碼重設表單 (步驟 2)
   * @param {string} userEmail - 用戶電子郵件
   */
  function createPasswordResetForm(userEmail) {
    // 創建新的表單容器
    const step2Div = document.createElement("div");
    step2Div.className = "login-form";
    step2Div.style.marginTop = "10px";

    // 插入密碼重設表單的 HTML 結構
    step2Div.innerHTML = `
      <div class="input-box">
        <label for="resetVerificationCode">驗證碼 Verification Code</label>
        <input type="text" id="resetVerificationCode" name="resetVerificationCode" required />
      </div>
      <div class="input-box">
        <label for="newPassword">設置新密碼 Set new password</label>
        <input type="password" id="newPassword" name="newPassword" required />
      </div>
      <div style="font-size: 12px; margin: 5px;">
        <div id="length-rule">✕ 至少8字元 (at least 8 characters)</div>
        <div id="uppercase-rule">✕ 含有一個大寫字母 (at least one uppercase letter)</div>
        <div id="lowercase-rule">✕ 含有一個小寫字母 (at least one lowercase letter)</div>
        <div id="number-rule">✕ 含有一個數字 (at least one number)</div>
      </div>
      <div class="input-box">
        <label for="confirmPassword">確認新密碼 Confirm new password</label>
        <input type="password" id="confirmPassword" name="confirmPassword" required />
      </div>
      <div class="submit-box">
        <button type="button" id="reset-password-btn">設置新密碼 Set New Password</button>
      </div>
    `;

    // 將表單添加到頁面
    document.querySelector(".login-wrapper").appendChild(step2Div);

    // 等待 DOM 更新後綁定事件處理器
    setTimeout(() => {
      const newPasswordInput = document.getElementById("newPassword");
      const confirmPasswordInput = document.getElementById("confirmPassword");
      const resetPasswordBtn = document.getElementById("reset-password-btn");

      // 綁定密碼輸入事件 - 即時驗證密碼強度
      newPasswordInput.addEventListener("input", updatePasswordRules);
      confirmPasswordInput.addEventListener("input", function () {
        updatePasswordRules();
        checkPasswordMatch();
      });

      // 綁定重設密碼按鈕事件
      resetPasswordBtn.addEventListener("click", async function () {
        await resetPassword(userEmail);
      });
    }, 100);
  }

  /**
   * 即時更新密碼強度規則顯示
   * 根據用戶輸入的密碼即時檢查並更新各項密碼要求的狀態
   */
  function updatePasswordRules() {
    const password = document.getElementById("newPassword").value;

    // 獲取各個密碼規則的顯示元素
    const lengthRule = document.getElementById("length-rule");
    const upperRule = document.getElementById("uppercase-rule");
    const lowerRule = document.getElementById("lowercase-rule");
    const numberRule = document.getElementById("number-rule");

    // 檢查密碼長度 (至少8字元)
    if (password.length >= 8) {
      lengthRule.textContent = "✓ 至少8字元 (at least 8 characters)";
      lengthRule.classList.add("valid");
    } else {
      lengthRule.textContent = "✕ 至少8字元 (at least 8 characters)";
      lengthRule.classList.remove("valid");
    }

    // 檢查大寫字母 (至少一個)
    if (/[A-Z]/.test(password)) {
      upperRule.textContent =
        "✓ 含有一個大寫字母 (at least one uppercase letter)";
      upperRule.classList.add("valid");
    } else {
      upperRule.textContent =
        "✕ 含有一個大寫字母 (at least one uppercase letter)";
      upperRule.classList.remove("valid");
    }

    // 檢查小寫字母 (至少一個)
    if (/[a-z]/.test(password)) {
      lowerRule.textContent =
        "✓ 含有一個小寫字母 (at least one lowercase letter)";
      lowerRule.classList.add("valid");
    } else {
      lowerRule.textContent =
        "✕ 含有一個小寫字母 (at least one lowercase letter)";
      lowerRule.classList.remove("valid");
    }

    // 檢查數字 (至少一個)
    if (/[0-9]/.test(password)) {
      numberRule.textContent = "✓ 含有一個數字 (at least one number)";
      numberRule.classList.add("valid");
    } else {
      numberRule.textContent = "✕ 含有一個數字 (at least one number)";
      numberRule.classList.remove("valid");
    }
  }

  /**
   * 檢查兩次輸入的密碼是否一致
   * 即時顯示密碼匹配狀態
   */
  function checkPasswordMatch() {
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    let warning = document.getElementById("password-match-warning");

    // 如果確認密碼已輸入且與新密碼不匹配
    if (confirmPassword && newPassword !== confirmPassword) {
      if (!warning) {
        // 創建警告提示元素
        const warnDiv = document.createElement("div");
        warnDiv.id = "password-match-warning";
        warnDiv.style.color = "red";
        warnDiv.style.fontSize = "12px";
        warnDiv.textContent = "密碼不一致 Passwords do not match";
        document
          .getElementById("confirmPassword")
          .parentNode.appendChild(warnDiv);
      } else {
        warning.style.display = "block";
      }
    } else {
      // 隱藏警告提示
      if (warning) {
        warning.style.display = "none";
      }
    }
  }

  /**
   * 驗證密碼是否符合所有安全要求
   * @param {string} password - 待驗證的密碼
   * @returns {boolean} 是否符合要求
   */
  function validatePassword(password) {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) && // 至少一個大寫字母
      /[a-z]/.test(password) && // 至少一個小寫字母
      /[0-9]/.test(password)
    ); // 至少一個數字
  }

  /**
   * 執行密碼重設操作
   * 向後端 API 發送密碼重設請求
   * @param {string} email - 用戶電子郵件
   */
  async function resetPassword(email) {
    const verificationCode = document
      .getElementById("resetVerificationCode")
      .value.trim();
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const resetPasswordBtn = document.getElementById("reset-password-btn");

    // 檢查驗證碼是否已輸入
    if (!verificationCode) {
      alert("請輸入驗證碼 Please enter verification code");
      return;
    }

    // 檢查密碼和確認密碼是否都已輸入
    if (!newPassword || !confirmPassword) {
      alert("請輸入密碼和確認密碼 Please enter password and confirm password");
      return;
    }

    // 驗證密碼強度
    if (!validatePassword(newPassword)) {
      alert(
        "密碼不符合要求，請檢查所有條件 Password does not meet requirements, please check all conditions"
      );
      return;
    }

    // 檢查兩次密碼輸入是否一致
    if (newPassword !== confirmPassword) {
      alert(
        "密碼不匹配，請重新確認 Passwords do not match, please confirm again"
      );
      return;
    }

    try {
      // 顯示載入狀態
      resetPasswordBtn.disabled = true;
      resetPasswordBtn.textContent = "重設中... Resetting...";

      // 調用 Google Apps Script API 重設密碼
      const params = new URLSearchParams({
        action: "reset_password",
        account: email,
        new_password: newPassword,
        token: verificationCode,
      }).toString();

      const response = await fetch(apiUrl, {
        redirect: "follow",
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: params,
      });

      const data = await response.json();

      if (data.success) {
        alert(
          "密碼重設成功！請使用新密碼登入 Password reset successfully! Please login with your new password"
        );
        // 重導向到登入頁面
        window.location.href = "login.html";
      } else {
        alert(
          data.message ||
            "密碼重設失敗，請稍後再試 Password reset failed, please try again later"
        );
      }
    } catch (error) {
      alert("網絡錯誤，請稍後再試 Network error, please try again later");
      console.error("Reset password error:", error);
    } finally {
      // 恢復按鈕狀態 (只有在沒有成功重導向時才會執行)
      resetPasswordBtn.disabled = false;
      resetPasswordBtn.textContent = "設置新密碼 Set New Password";
    }
  }

  /**
   * 驗證電子郵件格式是否正確
   * @param {string} email - 待驗證的電子郵件
   * @returns {boolean} 格式是否正確
   */
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
});

// 動態生成的 CSS 樣式
const style = document.createElement("style");
style.textContent = `
  .valid {
    color: green !important;
  }
`;
document.head.appendChild(style);
