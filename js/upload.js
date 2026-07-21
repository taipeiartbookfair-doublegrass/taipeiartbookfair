const form = document.getElementById("BoothApplication");
const submitButton = document.getElementById("submitButton");
const agreeCheckbox = document.getElementById("InformationRulesAgree");

// 初始化：submit button 預設為 disabled
if (submitButton) {
  submitButton.disabled = true;
}

// 監聽 checkbox 變化，控制 submit button 的啟用狀態
if (agreeCheckbox && submitButton) {
  agreeCheckbox.addEventListener("change", function () {
    submitButton.disabled = !this.checked;
  });
}

// Consolidate Captcha logic and shared functionality
const handleFormFileUpload = async (fileInput, form, submitButton, uploadUrl) => {
  // 如果沒有檔案輸入框或沒有選擇檔案，返回 true（允許繼續提交）
  if (!fileInput || !fileInput.files || !fileInput.files.length) {
    return true;
  }

  const file = fileInput.files[0];
  const maxSize = 8 * 1024 * 1024; // 8MB
  if (file.size > maxSize) {
    alert("File size exceeds the 8MB limit.");
    return false;
  }

  const allowedTypes = ["application/pdf"];
  if (!allowedTypes.includes(file.type)) {
    alert("Invalid file type. Please upload a PDF file.");
    return false;
  }

  try {
    const base64String = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });

    const inputValue = document.querySelector(
      "input[name='entry.1159390039']"
    ).value;
    const currentDateTime = new Date()
      .toISOString()
      .replace(/[-T:.]/g, "")
      .slice(0, 14);
    const newFileName = `${inputValue}_${currentDateTime}_${file.name}`;

    const data = {
      data: base64String,
      mimeType: file.type,
      filename: newFileName,
    };
    const bodyString = new URLSearchParams(data).toString();

    const uploadRes = await fetch(uploadUrl, {
      redirect: "follow",
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: bodyString,
    });

    const fileUrl = await uploadRes.text();
    document.getElementById("uploadedFileUrl").value = fileUrl;
    return true;
  } catch (error) {
    alert("File upload failed. Please try again.");
    return false;
  }
};

// _opencallUploadPromise：我們的 submit handler 等這個 Promise，
// 由此 handler 設定，確保上傳完成後再呼叫 API。
window._opencallUploadPromise = null;

form.addEventListener("submit", async function (e) {
  e.preventDefault();
  window._opencallUploadPromise = null;

  const selectedBoothType = document.querySelector(
    'input[name="entry.133172086"]:checked'
  );
  let fileInput;
  let needsUpload = false;

  if (selectedBoothType) {
    const boothValue = selectedBoothType.value;
    if (boothValue === "裝置類") {
      fileInput = document.getElementById("fileInput2");
      needsUpload = true;
    } else if (["創作商品", "書攤"].includes(boothValue)) {
      fileInput = document.getElementById("fileInput");
      needsUpload = true;
    } else if (boothValue === "策展攤") {
      fileInput = document.getElementById("fileInput3");
      needsUpload = true;
    }
  }

  if (needsUpload && fileInput) {
    if (fileInput.files && fileInput.files.length > 0) {
      submitButton.disabled = true;
      submitButton.innerText = "上傳中...";

      let resolveUpload, rejectUpload;
      window._opencallUploadPromise = new Promise((res, rej) => {
        resolveUpload = res;
        rejectUpload = rej;
      });

      const uploadSuccess = await handleFormFileUpload(
        fileInput,
        form,
        submitButton,
        "https://script.google.com/macros/s/AKfycbwhOkLqvvuiA-QmEXbh-Oi26r2I9t8YuhWGfWF4_6LvCaSXIwanCpqEe2r371_ivMNHtg/exec"
      );

      if (!uploadSuccess) {
        submitButton.disabled = false;
        submitButton.innerText = "提交";
        rejectUpload(new Error("upload failed"));
        return;
      }
      resolveUpload(); // 通知我們的 handler：上傳完成

    } else {
      let rejectUpload;
      window._opencallUploadPromise = new Promise((_, rej) => rejectUpload = rej);
      rejectUpload(new Error("no file selected"));
      alert("請先選擇檔案");
    }
  }
  // 不呼叫 form.submit()，由我們的 handler 負責送出
});
