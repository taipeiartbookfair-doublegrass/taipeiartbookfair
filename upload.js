const form = document.querySelector("form");
form.addEventListener("submit", function (event) {
  event.preventDefault(); // 防止頁面重新整理

  const formData = new FormData(form); // 這會收集表單中的所有資料

  fetch(
    "https://script.google.com/macros/s/AKfycbwhOkLqvvuiA-QmEXbh-Oi26r2I9t8YuhWGfWF4_6LvCaSXIwanCpqEe2r371_ivMNHtg/exec",
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
