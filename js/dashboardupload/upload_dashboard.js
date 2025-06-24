// 3 個 folder ID
const folderIds = {
  marketing: "1GBQiVxTbCdl-kCCMvNTc9Ejjhfsxu9ds",
  catalog: "1uE7korPZDcMRCo0nTkoiowEh3sVpw5QA",
  declaration: "11CnK9JWKistOUUf8HocJNb_lyK1WYdJp",
};

// Catalog 上傳
document
  .getElementById("uploadBtnCatalog")
  .addEventListener("click", async () => {
    const fileInput = document.getElementById("catalog-file");
    const result = await handleFileUpload(fileInput, folderIds.catalog);
    if (result) alert("Catalog uploaded successfully!");
  });

// Marketing 上傳
document
  .getElementById("uploadBtnMarketing")
  .addEventListener("click", async () => {
    const fileInput = document.getElementById("marketing-file");
    const result = await handleFileUpload(fileInput, folderIds.marketing);
    if (result) alert("Marketing material uploaded successfully!");
  });

// Declaration 上傳
document
  .getElementById("uploadBtnDeclaration")
  .addEventListener("click", async () => {
    const fileInput = document.getElementById("declaration-file");
    const result = await handleFileUpload(fileInput, folderIds.declaration);
    if (result) alert("Declaration uploaded successfully!");
  });

// 精簡 handleFileUpload
const handleFileUpload = async (fileInput, folderId) => {
  if (!fileInput || !fileInput.files || !fileInput.files.length) {
    alert("請先選擇檔案");
    return false;
  }

  const file = fileInput.files[0];
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    alert("File size exceeds the 10MB limit.");
    return false;
  }

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

    // 在 handleFileUpload 裡，加入這段
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
    return true;
  } catch (error) {
    alert("File upload failed. Please try again.");
    return false;
  }
};
