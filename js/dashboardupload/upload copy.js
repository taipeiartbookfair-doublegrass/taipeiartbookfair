// 取得表單元素和提交按鈕
const form = document.getElementById("BoothApplication");
const submitButton = document.getElementById("submitButton");

// 處理檔案上傳的函式，包含檔案驗證與上傳
const handleFileUpload = async (fileInput, form, submitButton, uploadUrl) => {
  // 檢查是否有選擇檔案
  if (!fileInput || !fileInput.files || !fileInput.files.length) {
    alert("請先選擇檔案");
    return false;
  }

  const file = fileInput.files[0]; // 取得使用者選擇的第一個檔案
  const maxSize = 8 * 1024 * 1024; // 設定最大檔案大小為8MB
  if (file.size > maxSize) {
    alert("File size exceeds the 8MB limit."); // 檔案太大時提示
    return false;
  }

  const allowedTypes = ["application/pdf"]; // 只允許PDF檔案
  if (!allowedTypes.includes(file.type)) {
    alert("Invalid file type. Please upload a PDF file."); // 檔案格式錯誤時提示
    return false;
  }

  try {
    // 將檔案轉成Base64字串
    const base64String = await new Promise((resolve, reject) => {
      const reader = new FileReader(); // 建立FileReader物件
      reader.onload = () => resolve(reader.result.split(",")[1]); // 讀取完成後取得Base64內容
      reader.onerror = (error) => reject(error); // 讀取失敗時回傳錯誤
      reader.readAsDataURL(file); // 以DataURL方式讀取檔案
    });

    // 取得表單中指定欄位的值（例如：申請人名稱或編號）
    const inputValue = document.querySelector(
      "input[name='entry.1159390039']"
    ).value;

    // 取得目前的日期與時間，格式化為字串（例如：20240618...）
    const currentDateTime = new Date()
      .toISOString()
      .replace(/[-T:.]/g, "")
      .slice(0, 14);

    // 組合新的檔案名稱：申請人_日期時間_原始檔名
    const newFileName = `${inputValue}_${currentDateTime}_${file.name}`;

    // 準備要上傳的資料
    const data = {
      data: base64String, // 檔案內容（Base64）
      mimeType: file.type, // 檔案MIME類型
      filename: newFileName, // 新檔名
    };
    // 將資料轉成URL查詢字串格式
    const bodyString = new URLSearchParams(data).toString();

    // 發送POST請求到指定的Google Apps Script網址
    const uploadRes = await fetch(uploadUrl, {
      redirect: "follow",
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8", // 設定內容類型
      },
      body: bodyString, // 上傳的內容
    });

    // 取得伺服器回傳的檔案網址
    const fileUrl = await uploadRes.text();
    // 將檔案網址寫入隱藏欄位，方便後續表單送出
    document.getElementById("uploadedFileUrl").value = fileUrl;
    return true; // 上傳成功
  } catch (error) {
    alert("File upload failed. Please try again."); // 上傳失敗時提示
    return false;
  }
};

// 監聽表單送出事件
form.addEventListener("submit", async function (e) {
  e.preventDefault(); // 阻止表單預設送出行為
  submitButton.disabled = true; // 禁用送出按鈕，避免重複送出
  submitButton.innerText = "Submitting..."; // 顯示送出中

  // 取得使用者選擇的攤位類型
  const selectedBoothType = document.querySelector(
    'input[name="entry.133172086"]:checked'
  );
  let fileInput;
  if (selectedBoothType) {
    const boothValue = selectedBoothType.value;
    // 根據不同攤位類型選擇不同的檔案輸入欄位
    if (boothValue === "裝置類") {
      fileInput = document.getElementById("fileInput2");
    } else if (["創作商品", "食物酒水", "書攤"].includes(boothValue)) {
      fileInput = document.getElementById("fileInput");
    }
  }

  // 執行檔案上傳
  const uploadSuccess = await handleFileUpload(
    fileInput,
    form,
    submitButton,
    "https://script.google.com/macros/s/AKfycbwhOkLqvvuiA-QmEXbh-Oi26r2I9t8YuhWGfWF4_6LvCaSXIwanCpqEe2r371_ivMNHtg/exec"
  );

  if (uploadSuccess) {
    form.submit(); // 上傳成功後送出表單
    setTimeout(() => {
      // 3秒後跳轉到完成頁面
      window.location.href = "../application-received.html";
    }, 3000);
  } else {
    // 上傳失敗時恢復按鈕狀態
    submitButton.disabled = false;
    submitButton.innerText = "Submit";
  }
});
