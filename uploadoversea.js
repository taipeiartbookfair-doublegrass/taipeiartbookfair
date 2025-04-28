const form = document.getElementById("BoothApplication");
const submitButton = document.getElementById("submitButton");

form.addEventListener("submit", async function (e) {
  e.preventDefault(); // 阻止預設提交

  const fileInput = document.getElementById("fileInput");
  if (!fileInput || !fileInput.files || !fileInput.files.length) {
    alert("請先選擇檔案");
    return;
  }

  const file = fileInput.files[0];

  // 檢查檔案大小（限制 8MB）
  const maxSize = 8 * 1024 * 1024; // 8MB
  if (file.size > maxSize) {
    alert("File size exceeds the 8MB limit.");
    return;
  }

  // 檢查檔案類型（僅允許 JPEG, PNG, PDF）
  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
  if (!allowedTypes.includes(file.type)) {
    alert("Invalid file type. Please upload a JPEG, PNG, or PDF file.");
    return;
  }

  try {
    // 轉成 Base64
    const base64String = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]); // 只取 Base64部分
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });

    // 使用 fetch 上傳到伺服器
    const data = {
      data: base64String,
      mimeType: file.type,
      filename: file.name,
    };
    const bodyString = new URLSearchParams(data).toString();

    const uploadRes = await fetch(
      "https://script.google.com/macros/s/AKfycbzDAdWlQzwUInG1tLQWjI-GE54ZzJEjpvUwhP_MXzewEwPsfG2Gon7HsDw2C_eKwJsa/exec",
      {
        redirect: "follow",
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: bodyString,
      }
    );

    if (!uploadRes.ok) {
      throw new Error("File upload failed");
    }

    const fileUrl = await uploadRes.text();
    const uploadedUrlInput = document.getElementById("uploadedFileUrl");
    if (uploadedUrlInput) {
      uploadedUrlInput.value = fileUrl;
    } else {
      // console.warn("找不到 uploadedFileUrl 欄位");
    }

    // 等所有驗證與上傳都成功，這時才真正送出表單
    form.submit();
  } catch (error) {
    console.log("file upload failed：", error);
    alert("File upload failed. Please try again.");
  }
});
