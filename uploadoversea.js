const form = document.querySelector("form");
form.addEventListener("submit", function (event) {
  event.preventDefault(); // 防止頁面重新整理

  const formData = new FormData(form); // 這會收集表單中的所有資料

  fetch(
    "https://script.google.com/macros/s/AKfycbxr_kswfFo24yC-9GlxkvO7nq3Z1MPpqMc2xdjKtL33N8UcLBzEKhPLbjowb23klY45/exec",
    {
      method: "POST",
      body: formData,
    }
  )
    .then((response) => response.json())
    .then((data) => {
      console.log("成功：", data);
    })
    .catch((error) => {
      console.error("錯誤：", error);
    });
});
