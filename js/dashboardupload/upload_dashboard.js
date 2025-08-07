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
    folder: folderIds.catalog,
    successMsg: "草率簿檔案上傳成功 Catalog uploaded successfully!",
    failMsg: "草率簿檔案上傳失敗 Upload failed.",
  },
  marketing: {
    btn: "uploadBtnMarketing",
    file: "marketing-file",
    status: "marketing-upload-status",
    storage: "marketing-uploaded-filename",
    folder: folderIds.marketing,
    successMsg:
      "行銷素材檔案上傳成功 Marketing material uploaded successfully!",
    failMsg: "行銷素材檔案上傳失敗 Upload failed.",
  },
  declaration: {
    btn: "uploadBtnDeclaration",
    file: "declaration-file",
    status: "declaration-upload-status",
    storage: "declaration-uploaded-filename",
    folder: folderIds.declaration,
    successMsg: "同意書檔案上傳成功 Declaration uploaded successfully!",
    failMsg: "同意書檔案上傳失敗 Upload failed.",
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
      const result = await handleFileUpload(
        fileInput,
        conf.folder,
        conf.storage,
        statusSpan
      );
      alert(result ? conf.successMsg : conf.failMsg);
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
  statusSpan
) => {
  if (!fileInput || !fileInput.files || !fileInput.files.length) {
    alert("請先選擇檔案 Please select a file first.");
    return false;
  }

  const file = fileInput.files[0];
  // 刪除檔案大小限制
  // const maxSize = 10 * 1024 * 1024;
  // if (file.size > maxSize) {
  //   alert("File size exceeds the 10MB limit.");
  //   return false;
  // }

  try {
    const base64String = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });

    // 取得攤商編號
    let applicationNumber = "";
    const appNumEl = document.getElementById("application-number");
    if (appNumEl) {
      applicationNumber = appNumEl.textContent.trim();
    }

    // 決定檔案類型
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
    const uploadRes = await fetch(
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

    await uploadRes.text();

    // 上傳成功，顯示檔名並存 localStorage
    if (statusSpan) {
      statusSpan.textContent = `Uploaded: ${file.name}`;
      statusSpan.style.color = "green";
      statusSpan.style.fontSize = "0.8em";
    }
    // 不再存 localStorage
    // if (storageKey) {
    //   localStorage.setItem(storageKey, file.name);
    // }
    return true;
  } catch (error) {
    // 上傳失敗
    if (statusSpan) {
      statusSpan.textContent = "Upload failed";
      statusSpan.style.color = "red";
      statusSpan.style.fontSize = "0.8em";
      statusSpan.style.marginTop = "0.3rem";
    }
    return false;
  }
};

// 刪除這段：頁面載入時自動顯示 localStorage 狀態
// window.addEventListener("DOMContentLoaded", function () {
//   Object.keys(uploadStatusMap).forEach((key) => {
//     const conf = uploadStatusMap[key];
//     const statusSpan = document.getElementById(conf.status);
//     const filename = localStorage.getItem(conf.storage);
//     if (statusSpan && filename) {
//       statusSpan.textContent = `Uploaded: ${filename}`;
//       statusSpan.style.color = "green";
//     }
//   });
// });
