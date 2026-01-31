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

// 上傳檔案並將回傳的 URL 寫入指定的 hidden 欄位（支援 Portfolio / Proposal / Curation 三個欄位）
const handleFileUpload = async (fileInput, form, submitButton, uploadUrl, hiddenFieldId) => {
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

  const fieldId = hiddenFieldId || "uploadedFileUrl";
  try {
    const base64String = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });

    const exhibitorInput = document.querySelector("input[name='entry.1159390039']");
    const inputValue = exhibitorInput ? exhibitorInput.value : "exhibitor";
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
    const hiddenEl = document.getElementById(fieldId);
    if (hiddenEl) hiddenEl.value = fileUrl;
    return true;
  } catch (error) {
    alert("File upload failed. Please try again.");
    return false;
  }
};

const UPLOAD_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzDAdWlQzwUInG1tLQWjI-GE54ZzJEjpvUwhP_MXzewEwPsfG2Gon7HsDw2C_eKwJsa/exec";

// 送出後統一跳轉到成功頁（表單 target 為 hidden_iframe，主頁不會換頁，需手動跳轉）
function redirectToSuccessPage() {
  // 與表單同目錄，避免 ../ 在部分環境錯誤
  const successUrl = "application-received.html";
  window.location.href = successUrl;
}

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const selectedBoothType = document.querySelector(
    'input[name="entry.133172086"]:checked'
  );
  let fileInput;
  let hiddenFieldId;
  let needsUpload = false;
  // 支援中文（本地）與英文（海外 oversea_20251218_invite.html）攤位類型
  if (selectedBoothType) {
    const boothValue = selectedBoothType.value;
    if (boothValue === "裝置類" || boothValue === "Installation Booth") {
      fileInput = document.getElementById("fileInput2");
      hiddenFieldId = "uploadedFileUrl2";
      needsUpload = true;
    } else if (["創作商品", "書攤", "Regular Book Booth", "Regular Non-Book Booth"].includes(boothValue)) {
      fileInput = document.getElementById("fileInput");
      hiddenFieldId = "uploadedFileUrl";
      needsUpload = true;
    } else if (boothValue === "策展攤" || boothValue === "Curation Booth") {
      fileInput = document.getElementById("fileInput3");
      hiddenFieldId = "uploadedFileUrl3";
      needsUpload = true;
    }
  }

  if (needsUpload && fileInput && fileInput.files && fileInput.files.length > 0) {
    submitButton.disabled = true;
    submitButton.innerText = "Submitting...";

    const uploadSuccess = await handleFileUpload(
      fileInput,
      form,
      submitButton,
      UPLOAD_SCRIPT_URL,
      hiddenFieldId
    );

    if (!uploadSuccess) {
      submitButton.disabled = false;
      submitButton.innerText = "Submit";
      return;
    }
  } else if (needsUpload && fileInput) {
    alert("Please select a file first.");
    return;
  }

  // 表單送交到 hidden iframe，主頁不換頁，故一律由我們送出並跳轉
  submitButton.disabled = true;
  submitButton.innerText = "Submitting...";
  form.submit();
  setTimeout(redirectToSuccessPage, 3000);
});
