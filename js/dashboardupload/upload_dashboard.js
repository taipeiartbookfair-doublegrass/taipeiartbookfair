// 3 個 folder ID
const folderIds = {
  marketing: "1GBQiVxTbCdl-kCCMvNTc9Ejjhfsxu9ds",
  catalog: "1uE7korPZDcMRCo0nTkoiowEh3sVpw5QA",
  declaration: "11CnK9JWKistOUUf8HocJNb_lyK1WYdJp",
};

// 共用顯示與 localStorage key
const uploadStatusMap = {
  catalog: {
    btn: "uploadBtnCatalog",
    file: "catalog-file",
    status: "catalog-upload-status",
    storage: "catalog-uploaded-filename",
    storageTime: "catalog-uploaded-time",
    folder: folderIds.catalog,
    successMsg: "草率簿檔案上傳成功 Catalog uploaded successfully!",
    failMsg: "草率簿檔案上傳失敗 Upload failed.",
    typeName: "草率簿檔案",
    typeNameEn: "Catalog file",
  },
  marketing: {
    btn: "uploadBtnMarketing",
    file: "marketing-file",
    status: "marketing-upload-status",
    storage: "marketing-uploaded-filename",
    storageTime: "marketing-uploaded-time",
    folder: folderIds.marketing,
    successMsg:
      "行銷素材檔案上傳成功 Marketing material uploaded successfully!",
    failMsg: "行銷素材檔案上傳失敗 Upload failed.",
    typeName: "行銷素材檔案",
    typeNameEn: "Marketing material",
  },
  declaration: {
    btn: "uploadBtnDeclaration",
    file: "declaration-file",
    status: "declaration-upload-status",
    storage: "declaration-uploaded-filename",
    storageTime: "declaration-uploaded-time",
    folder: folderIds.declaration,
    successMsg: "上傳成功！我們將盡快完成審核。\nUpload successful! We'll review your submission shortly.",
    failMsg: "同意書檔案上傳失敗 Upload failed.",
    typeName: "同意書檔案",
    typeNameEn: "Declaration file",
  },
};

// 綁定所有上傳按鈕
Object.keys(uploadStatusMap).forEach((key) => {
  const conf = uploadStatusMap[key];
  const btn = document.getElementById(conf.btn);
  if (btn) {
    btn.addEventListener("click", async (e) => {
      btn.disabled = true;
      const fileInput = document.getElementById(conf.file);
      const statusSpan = document.getElementById(conf.status);
      const uploadResult = await handleFileUpload(
        fileInput,
        conf.folder,
        conf.storage,
        conf.storageTime,
        statusSpan,
        conf.typeName,
        conf.typeNameEn
      );
      
      // 顯示詳細的成功/失敗訊息
      if (uploadResult.success) {
        const file = fileInput.files[0];
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        const successDetail = `${conf.successMsg}\n\n檔案資訊 File Info:\n- 檔名 Filename: ${file.name}\n- 大小 Size: ${fileSizeMB} MB\n- 上傳時間 Upload Time: ${uploadResult.uploadTime}\n\n請保留此頁面截圖作為上傳憑證。\nPlease keep a screenshot of this page as proof of upload.\n\n重新登入後，若狀態消失，請檢查瀏覽器是否清除了快取。\nIf the status disappears after re-login, please check if your browser cleared the cache.`;
        alert(successDetail);
      } else {
        alert(uploadResult.errorMessage || conf.failMsg);
      }
      
      // 延遲 0.5 秒再啟用
      setTimeout(() => {
        btn.disabled = false;
      }, 500);
    });
  }
});

// 上傳成功後顯示狀態，並存進 localStorage
const handleFileUpload = async (
  fileInput,
  folderId,
  storageKey,
  storageTimeKey,
  statusSpan,
  typeName,
  typeNameEn
) => {
  if (!fileInput || !fileInput.files || !fileInput.files.length) {
    return {
      success: false,
      errorMessage: "請先選擇檔案 Please select a file first."
    };
  }

  const file = fileInput.files[0];
  const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
  
  // 檢查檔案大小（設定 50MB 限制）
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      success: false,
      errorMessage: `檔案大小超過限制 File size exceeds limit.\n\n檔案資訊 File Info:\n- 檔名 Filename: ${file.name}\n- 大小 Size: ${fileSizeMB} MB\n- 限制 Limit: 50 MB\n\n請壓縮檔案後再試。\nPlease compress the file and try again.`
    };
  }

  let errorStep = "";

  try {
    // 步驟 1: 讀取檔案
    errorStep = "讀取檔案 Reading file";
    const base64String = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const result = reader.result.split(",")[1];
          if (!result) {
            reject(new Error("無法讀取檔案內容 Unable to read file content"));
          } else {
            resolve(result);
          }
        } catch (e) {
          reject(new Error(`檔案讀取錯誤 File read error: ${e.message}`));
        }
      };
      reader.onerror = (error) => {
        reject(new Error(`檔案讀取失敗 File read failed: ${error.message || "Unknown error"}`));
      };
      reader.readAsDataURL(file);
    });

    // 步驟 2: 取得攤商編號
    errorStep = "取得攤商編號 Getting application number";
    let applicationNumber = "";
    const appNumEl = document.getElementById("application-number");
    if (appNumEl) {
      applicationNumber = appNumEl.textContent.trim();
    }
    if (!applicationNumber) {
      return {
        success: false,
        errorMessage: `無法取得攤商編號 Unable to get application number.\n\n請確認您已正確登入，並重新整理頁面後再試。\nPlease make sure you are logged in correctly and refresh the page before trying again.`
      };
    }

    // 步驟 3: 決定檔案類型
    errorStep = "準備上傳資料 Preparing upload data";
    let fileType = "";
    if (folderId === folderIds.declaration) fileType = "declaration";
    else if (folderId === folderIds.catalog) fileType = "catalog";
    else if (folderId === folderIds.marketing) fileType = "marketing";

    // 組合檔名：攤商編號_檔案類型_原始檔名
    const newFileName = `${applicationNumber}_${fileType}_${file.name}`;

    const data = {
      data: base64String,
      mimeType: file.type,
      filename: newFileName,
      folderId: folderId,
    };

    const bodyString = new URLSearchParams(data).toString();
    
    // 步驟 4: 上傳到伺服器
    errorStep = "上傳到伺服器 Uploading to server";
    let uploadRes;
    try {
      uploadRes = await fetch(
        "https://script.google.com/macros/s/AKfycbwB6gvxUJA-_i-1oWuZnya0YHoa4nwv8bioZUjZAaGvf-ibqGpyNcujUL6LEowwqN1s/exec",
        {
          redirect: "follow",
          method: "POST",
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
          },
          body: bodyString,
        }
      );
    } catch (fetchError) {
      // 網路錯誤
      if (fetchError.name === "TypeError" && fetchError.message.includes("fetch")) {
        return {
          success: false,
          errorMessage: `網路連線錯誤 Network connection error.\n\n錯誤詳情 Error Details:\n- 步驟 Step: ${errorStep}\n- 錯誤 Error: ${fetchError.message}\n- 檔案資訊 File Info:\n  - 檔名 Filename: ${file.name}\n  - 大小 Size: ${fileSizeMB} MB\n\n可能原因 Possible causes:\n1. 網路連線不穩定 Unstable network connection\n2. 防火牆或代理伺服器阻擋 Firewall or proxy blocking\n3. 伺服器暫時無法連線 Server temporarily unavailable\n\n建議 Solutions:\n- 檢查網路連線 Check network connection\n- 稍後再試 Try again later\n- 如持續失敗，請截圖此錯誤訊息並聯繫我們 If the problem persists, please screenshot this error message and contact us`
        };
      }
      throw fetchError;
    }

    // 檢查 HTTP 狀態碼
    if (!uploadRes.ok) {
      const statusText = uploadRes.statusText || "Unknown";
      return {
        success: false,
        errorMessage: `伺服器回應錯誤 Server response error.\n\n錯誤詳情 Error Details:\n- HTTP 狀態碼 HTTP Status: ${uploadRes.status} ${statusText}\n- 步驟 Step: ${errorStep}\n- 檔案資訊 File Info:\n  - 檔名 Filename: ${file.name}\n  - 大小 Size: ${fileSizeMB} MB\n\n請稍後再試，或聯繫我們。\nPlease try again later or contact us.`
      };
    }

    // 步驟 5: 讀取回應內容
    errorStep = "處理伺服器回應 Processing server response";
    let responseText = "";
    try {
      responseText = await uploadRes.text();
    } catch (textError) {
      return {
        success: false,
        errorMessage: `無法讀取伺服器回應 Unable to read server response.\n\n錯誤詳情 Error Details:\n- 步驟 Step: ${errorStep}\n- 錯誤 Error: ${textError.message}\n- 檔案資訊 File Info:\n  - 檔名 Filename: ${file.name}\n  - 大小 Size: ${fileSizeMB} MB\n\n請稍後再試。\nPlease try again later.`
      };
    }

    // 檢查回應內容是否包含錯誤訊息
    if (responseText.toLowerCase().includes("error") || 
        responseText.toLowerCase().includes("失敗") ||
        responseText.toLowerCase().includes("fail")) {
      return {
        success: false,
        errorMessage: `上傳失敗 Upload failed.\n\n錯誤詳情 Error Details:\n- 步驟 Step: ${errorStep}\n- 伺服器回應 Server Response: ${responseText.substring(0, 200)}\n- 檔案資訊 File Info:\n  - 檔名 Filename: ${file.name}\n  - 大小 Size: ${fileSizeMB} MB\n\n請檢查檔案格式是否正確，或聯繫我們。\nPlease check if the file format is correct, or contact us.`
      };
    }

    // 上傳成功，顯示檔名並存 localStorage
    const uploadTime = new Date().toLocaleString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });

    if (statusSpan) {
      statusSpan.textContent = `✓ 已上傳 Uploaded: ${file.name} (${uploadTime})`;
      statusSpan.style.color = "green";
      statusSpan.style.fontSize = "0.8em";
      statusSpan.style.marginTop = "0.3rem";
    }

    // 存 localStorage（包含檔名和時間）
    if (storageKey) {
      localStorage.setItem(storageKey, file.name);
    }
    if (storageTimeKey) {
      localStorage.setItem(storageTimeKey, uploadTime);
    }

    return {
      success: true,
      uploadTime: uploadTime,
      fileName: file.name
    };

  } catch (error) {
    // 上傳失敗 - 詳細錯誤訊息
    let errorMessage = `${typeName}上傳失敗 ${typeNameEn} upload failed.\n\n`;
    errorMessage += `錯誤詳情 Error Details:\n`;
    errorMessage += `- 步驟 Step: ${errorStep}\n`;
    errorMessage += `- 錯誤類型 Error Type: ${error.name || "Unknown"}\n`;
    errorMessage += `- 錯誤訊息 Error Message: ${error.message || "Unknown error"}\n`;
    errorMessage += `- 檔案資訊 File Info:\n`;
    errorMessage += `  - 檔名 Filename: ${file.name}\n`;
    errorMessage += `  - 大小 Size: ${fileSizeMB} MB\n`;
    errorMessage += `  - 類型 Type: ${file.type || "Unknown"}\n\n`;

    // 根據錯誤類型提供建議
    if (error.name === "NetworkError" || error.message.includes("network") || error.message.includes("fetch")) {
      errorMessage += `可能原因 Possible causes:\n`;
      errorMessage += `1. 網路連線不穩定 Unstable network connection\n`;
      errorMessage += `2. 防火牆或代理伺服器阻擋 Firewall or proxy blocking\n`;
      errorMessage += `3. 伺服器暫時無法連線 Server temporarily unavailable\n\n`;
      errorMessage += `建議 Solutions:\n`;
      errorMessage += `- 檢查網路連線 Check network connection\n`;
      errorMessage += `- 稍後再試 Try again later\n`;
      errorMessage += `- 如持續失敗，請截圖此錯誤訊息並聯繫我們 If the problem persists, please screenshot this error message and contact us`;
    } else if (error.message.includes("read") || error.message.includes("FileReader")) {
      errorMessage += `可能原因 Possible causes:\n`;
      errorMessage += `1. 檔案損壞或格式不正確 File corrupted or incorrect format\n`;
      errorMessage += `2. 檔案過大 File too large\n`;
      errorMessage += `3. 瀏覽器不支援此檔案類型 Browser doesn't support this file type\n\n`;
      errorMessage += `建議 Solutions:\n`;
      errorMessage += `- 檢查檔案是否完整 Check if file is complete\n`;
      errorMessage += `- 嘗試使用其他檔案格式 Try a different file format\n`;
      errorMessage += `- 如持續失敗，請截圖此錯誤訊息並聯繫我們 If the problem persists, please screenshot this error message and contact us`;
    } else {
      errorMessage += `建議 Solutions:\n`;
      errorMessage += `- 重新整理頁面後再試 Refresh the page and try again\n`;
      errorMessage += `- 檢查檔案格式是否正確 Check if file format is correct\n`;
      errorMessage += `- 如持續失敗，請截圖此錯誤訊息並聯繫我們 If the problem persists, please screenshot this error message and contact us`;
    }

    // 更新狀態顯示
    if (statusSpan) {
      statusSpan.textContent = `✗ 上傳失敗 Upload failed (${errorStep})`;
      statusSpan.style.color = "red";
      statusSpan.style.fontSize = "0.8em";
      statusSpan.style.marginTop = "0.3rem";
    }

    return {
      success: false,
      errorMessage: errorMessage
    };
  }
};

// 頁面載入時自動顯示 localStorage 狀態
window.addEventListener("DOMContentLoaded", function () {
  Object.keys(uploadStatusMap).forEach((key) => {
    const conf = uploadStatusMap[key];
    const statusSpan = document.getElementById(conf.status);
    const filename = localStorage.getItem(conf.storage);
    const uploadTime = localStorage.getItem(conf.storageTime);
    
    if (statusSpan && filename) {
      if (uploadTime) {
        statusSpan.textContent = `✓ 已上傳 Uploaded: ${filename} (${uploadTime})`;
      } else {
        statusSpan.textContent = `✓ 已上傳 Uploaded: ${filename}`;
      }
      statusSpan.style.color = "green";
      statusSpan.style.fontSize = "0.8em";
      statusSpan.style.marginTop = "0.3rem";
    }
  });
});
