const subCategoryOptions = {
  book: [
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
  nonbook: [
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
  food: [
    { value: "f00 甜點", text: "f00 甜點（Desserts）" },
    { value: "f01 飲品", text: "f01 飲品（Beverages）" },
    { value: "f02 鹹食", text: "f02 鹹食（Savory Foods）" },
    { value: "f03 茶・咖啡", text: "f03 茶・咖啡（Tea & Coffee）" },
  ],
};

const subSelect = document.getElementById("sub-category");
const leftthing = document.getElementById("workcat");
const rightthing = document.getElementById("workcat2");

// 攤位類型 radio buttons
const boothTypeRadios = document.querySelectorAll(
  'input[name="entry.133172086"]'
);
boothTypeRadios.forEach((radio) => {
  radio.addEventListener("change", function () {
    const boothType = this.value;
    let categoryKey = "";

    if (boothType === "書攤") {
      categoryKey = "book";
    } else if (boothType === "創作商品") {
      categoryKey = "nonbook";
    } else if (boothType === "食物酒水") {
      categoryKey = "food";
    } else {
      // 裝置類，隱藏 sub-category
      subSelect.innerHTML = "";
      leftthing.style.display = "none";
      rightthing.style.display = "none";
      return;
    }

    // 有需要選子類別的話，顯示出來
    leftthing.style.display = "block";
    rightthing.style.display = "block";

    // 重新塞子類別
    subSelect.innerHTML =
      '<option value="" disabled selected hidden>請選擇作品類別</option>';
    subCategoryOptions[categoryKey].forEach((opt) => {
      const option = document.createElement("option");
      option.value = opt.value;
      option.textContent = opt.text;
      subSelect.appendChild(option);
    });

    subSelect.disabled = false;
    subSelect.style.color = "grey"; // 重設字色
  });
});

// 當子類別選到時，更新選項顏色
subSelect.addEventListener("change", function () {
  this.style.color = this.value ? "black" : "grey";
});

// 頁面載入時，檢查是否已有選中的攤種，並觸發一次對應的邏輯
window.addEventListener("DOMContentLoaded", function () {
  const selectedRadio = Array.from(boothTypeRadios).find((r) => r.checked);
  const selectedSubCategory = subSelect.value;

  if (selectedRadio) {
    // 先觸發攤種選項，讓 sub-category 被建立出來
    selectedRadio.dispatchEvent(new Event("change"));

    // 稍微延遲，等下拉選單建立完後再設定原本的值
    setTimeout(() => {
      if (selectedSubCategory) {
        subSelect.value = selectedSubCategory;
        subSelect.style.color = "black";
      }
    }, 0);
  }
});
