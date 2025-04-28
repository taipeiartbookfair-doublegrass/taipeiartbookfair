document
  .getElementById("uploadButton")
  .addEventListener("click", async function () {
    const fileInput = document.getElementById("fileInput");

    if (!fileInput.files.length) {
      alert("請先選擇檔案");
      return;
    }

    // 檢查檔案大小（限制 8MB）
    const maxSize = 8 * 1024 * 1024; // 8MB
    if (file.size > maxSize) {
      alert("File size exceeds the 8MB limit.");
      return;
    }

    // 檢查檔案類型（限制為圖片或 PDF）
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      alert("Invalid file type. Please upload a JPEG, PNG, or PDF file.");
      return;
    }
    // TODO :need to delete
    console.log(
      "檔案名稱：",
      file.name,
      "檔案大小：",
      file.size,
      "檔案類型：",
      file.type,
      "start encoding..."
    );
    // 把檔案轉成 Base64
    const base64String = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]); // 只取 Base64 的部分
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
    // TODO :need to delete
    console.log("bs64", base64String);
    try {
      const uploadRes = await fetch(
        "https://script.google.com/macros/s/AKfycbzDAdWlQzwUInG1tLQWjI-GE54ZzJEjpvUwhP_MXzewEwPsfG2Gon7HsDw2C_eKwJsa/exec",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filename: file.name,
            mimeType: file.type,
            data: base64String,
          }),
        }
      );

      const fileUrl = await uploadRes.text();
      document.getElementById("uploadedFileUrl").value = fileUrl;
      // TODO :need to delete
      console.log("上傳成功，檔案網址是：", fileUrl);
    } catch (error) {
      console.error("上傳失敗：", error);
      alert("File upload failed. Please try again.");
    }
  });
