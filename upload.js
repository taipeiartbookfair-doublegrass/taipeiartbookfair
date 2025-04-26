document
  .getElementById("uploadButton")
  .addEventListener("click", async function () {
    const fileInput = document.getElementById("fileInput");

    // 如果使用者沒有選檔案，就不做事
    if (!fileInput.files.length) {
      alert("請先選擇檔案！");
      return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);
    formData.append("formId", "自訂的一個ID"); // 這可以亂給，例如 'abc123'
    formData.append("category", "artwork"); // 可以設定分類（或不用）

    try {
      const uploadRes = await fetch("你的upload伺服器網址", {
        method: "POST",
        body: formData,
      });

      const resultText = await uploadRes.text(); // 從 server 拿回來的東西（應該是網址）

      console.log("上傳成功，檔案網址是：", resultText);

      // TODO: 這裡 resultText 拿到了，你可以接著做「送表單」的動作
    } catch (error) {
      console.error("上傳失敗：", error);
    }
  });
