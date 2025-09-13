const subCategoryOptions = {
  書: [
    { value: "b00 攝影", text: "b00 攝影（Photography）" },
    { value: "b01 插畫", text: "b01 插畫（Illustration）" },
    { value: "b02 漫畫", text: "b02 漫畫（Comics）" },
    { value: "b03 平面設計", text: "b03 平面設計（Graphic & Design）" },
    {
      value: "b04 拼貼・混合媒材・聯合創作",
      text: "b04 拼貼・混合媒材・聯合創作（Collage & Mixture & Collective）",
    },
    {
      value: "b05 雜誌與紙本出版",
      text: "b05 雜誌與紙本出版（Magazine & Papers）",
    },
    {
      value: "b06 概念與實驗性出版",
      text: "b06 概念與實驗性出版（Conceptual & Experimental）",
    },
    {
      value: "b07 工藝與特殊材質",
      text: "b07 工藝與特殊材質（Craftwork & Different Material）",
    },
    { value: "b08 文學與寫作", text: "b08 文學與寫作（Literature & Writing）" },
    {
      value: "b09 專案・策展・議題",
      text: "b09 專案・策展・議題（Project & Curatorial & Issue）",
    },
    {
      value: "b10 選集與收藏出版物",
      text: "b10 選集與收藏出版物（Collection）",
    },
  ],
  非書: [
    { value: "c00 角色週邊商品", text: "c00 角色週邊商品（Character Merch）" },
    { value: "c01 印刷品", text: "c01 印刷品（Printed Matter）" },
    {
      value: "c02 手工藝與配件",
      text: "c02 手工藝與配件（Crafts & Accessories）",
    },
    { value: "c03 布料與刺繡", text: "c03 布料與刺繡（Fabric & Embroidery）" },
    { value: "c04 刺青", text: "c04 刺青（Tattoo）" },
    { value: "c05 玩具與模型", text: "c05 玩具與模型（Toy & Model）" },
    { value: "c06 生活風格商品", text: "c06 生活風格商品（Life Attitude）" },
    { value: "c07 古董", text: "c07 古董（Antiques）" },
    {
      value: "c08 花藝・植栽・精品",
      text: "c08 花藝・植栽・精品（Ikebana & Plant & Boutique）",
    },
    { value: "c10 音樂", text: "c10 音樂（Music）" },
  ],
};

const mainSelect = document.getElementById("main-category");
const subSelect = document.getElementById("sub-category");
const hiddenSubCategoryInput = document.getElementById("hidden-sub-category");

mainSelect.addEventListener("change", function () {
  const selected = this.value;
  console.log("Main category selected:", selected); // Debugging
  subSelect.innerHTML =
    '<option value="" disabled selected hidden>Please enter your sub-category</option>';

  if (subCategoryOptions[selected]) {
    subCategoryOptions[selected].forEach((opt) => {
      const option = document.createElement("option");
      option.value = opt.value;
      option.textContent = opt.text;
      subSelect.appendChild(option);
    });
    subSelect.disabled = false;
  } else {
    subSelect.disabled = true;
  }
});

subSelect.addEventListener("change", function () {
  console.log("Sub-category selected:", this.value); // Debugging
  // When a sub-category is selected, update the hidden input value for submission to Google Form
  hiddenSubCategoryInput.value = this.value;
});
