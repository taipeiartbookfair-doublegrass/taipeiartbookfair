const form = document.getElementById("BoothApplication");
const submitButton = document.getElementById("submitButton");

form.addEventListener("submit", async function (e) {
  e.preventDefault(); // 阻止預設提交
  submitButton.disabled = true;
  submitButton.innerText = "Submitting...";
  const fileInput = document.getElementById("fileInput");
  if (!fileInput || !fileInput.files || !fileInput.files.length) {
    alert("請先選擇檔案");
    e.stopPropagation(); // 停止事件傳遞
  }

  const file = fileInput.files[0];
  // console.log("Selected file:", file); // Debugging
  // 檢查檔案大小（限制 8MB）
  const maxSize = 8 * 1024 * 1024; // 8MB
  if (file.size > maxSize) {
    alert("File size exceeds the 8MB limit.");
    e.stopPropagation(); // 停止事件傳遞
  }

  // 檢查檔案類型（僅允許 PDF）
  const allowedTypes = ["application/pdf"];
  if (!allowedTypes.includes(file.type)) {
    alert("Invalid file type. Please upload a PDF file.");
    e.stopPropagation(); // 停止事件傳遞
  }
  // console.log("file start encode"); // Debugging
  try {
    // 轉成 Base64
    const base64String = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]); // 只取 Base64部分
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });

    const inputValue = document.querySelector(
      "input[name='entry.1159390039']"
    ).value;

    // 獲取當前的日期和時間，格式為 YYYYMMDDHHMMSS
    const currentDateTime = new Date()
      .toISOString()
      .replace(/[-T:.]/g, "")
      .slice(0, 14);

    const newFileName = `${inputValue}_${currentDateTime}_${file.name}`;

    // 使用 fetch 上傳到伺服器
    const data = {
      data: base64String,
      mimeType: file.type,
      filename: newFileName,
    };
    const bodyString = new URLSearchParams(data).toString();
    // console.log("bodyString", bodyString); // Debugging
    // console.log("start upload"); // Debugging
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

    // if (!uploadRes.ok) {
    //   throw new Error("File upload failed");
    // }
    // console.log("uploadRes", uploadRes); // Debugging
    const fileUrl = await uploadRes.text();
    document.getElementById("uploadedFileUrl").value = fileUrl;
    // TODO :need to delete
    // console.log("上傳成功，檔案網址是：", fileUrl);

    // 等所有驗證與上傳都成功，這時才真正送出表單
    // console.log("file upload success"); // Debugging
    // console.log("start submit"); // Debugging

    form.submit();

    // 延遲 1.5 秒後進行頁面重定向
    setTimeout(function () {
      window.location.href = "application-received.html";
    }, 1500);
  } catch (error) {
    // console.log("file upload failed：", error);
    alert("File upload failed. Please try again.");
    e.stopPropagation(); // 停止事件傳遞
  }
});
