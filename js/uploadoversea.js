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
const handleFileUpload = async (fileInput, form, submitButton, uploadUrl) => {
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

form.addEventListener("submit", async function (e) {
  const selectedBoothType = document.querySelector(
    'input[name="entry.133172086"]:checked'
  );
  let fileInput;
  let needsUpload = false;
  
  if (selectedBoothType) {
    const boothValue = selectedBoothType.value;
    if (boothValue === "Installation Booth") {
      fileInput = document.getElementById("fileInput2");
      needsUpload = true;
    } else if (["Regular Non-Book Booth", "Regular Book Booth"].includes(boothValue)) {
      fileInput = document.getElementById("fileInput");
      needsUpload = true;
    } else if (boothValue === "Curation Booth") {
      fileInput = document.getElementById("fileInput3");
      needsUpload = true;
    }
  }

  // 如果需要上傳檔案，先處理上傳
  if (needsUpload && fileInput) {
    // 檢查是否有選擇檔案
    if (fileInput.files && fileInput.files.length > 0) {
      e.preventDefault(); // 只有需要上傳時才阻止預設提交
      submitButton.disabled = true;
      submitButton.innerText = "Submitting...";

      const uploadSuccess = await handleFileUpload(
        fileInput,
        form,
        submitButton,
        "https://script.google.com/macros/s/AKfycbzDAdWlQzwUInG1tLQWjI-GE54ZzJEjpvUwhP_MXzewEwPsfG2Gon7HsDw2C_eKwJsa/exec"
      );

      if (!uploadSuccess) {
        // 上傳失敗，恢復按鈕
        submitButton.disabled = false;
        submitButton.innerText = "Submit";
        return;
      }

      // 上傳成功，提交表單
      submitButton.disabled = true;
      form.submit();
      setTimeout(() => {
        window.location.href = "../application-received.html";
      }, 3000);
    } else {
      // 需要上傳但沒有選擇檔案，阻止提交並提示
      e.preventDefault();
      alert("Please select a file first.");
      return;
    }
  } else {
    // 不需要上傳檔案，讓表單正常提交
    submitButton.disabled = true;
    submitButton.innerText = "Submitting...";
    // 不阻止預設提交行為，讓表單直接提交到 Google Forms
  }
});
