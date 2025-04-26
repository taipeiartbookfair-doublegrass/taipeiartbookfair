const subCategoryOptions = {
  book: [
    { value: 'b00 攝影', text: 'b00 攝影（Photography）' },
    { value: 'b01 插畫', text: 'b01 插畫（Illustration）' },
    { value: 'b02 漫畫', text: 'b02 漫畫（Comics）' },
    { value: 'b03 平面設計', text: 'b03 平面設計（Graphic & Design）' },
    { value: 'b04 拼貼・混合媒材・聯合創作', text: 'b04 拼貼・混合媒材・聯合創作（Collage & Mixture & Collective）' },
    { value: 'b05 雜誌與紙本出版', text: 'b05 雜誌與紙本出版（Magazine & Papers）' },
    { value: 'b06 概念與實驗性出版', text: 'b06 概念與實驗性出版（Conceptual & Experimental）' },
    { value: 'b07 藝與特殊材質', text: 'b07 工藝與特殊材質（Craftwork & Different Material）' },
    { value: 'b08 文學與寫作', text: 'b08 文學與寫作（Literature & Writing）' },
    { value: 'b09 專案・策展・議題', text: 'b09 專案・策展・議題（Project & Curatorial & Issue）' },
    { value: 'b10 選集與收藏出版物', text: 'b10 選集與收藏出版物（Collection）' }
  ],
  nonbook: [
    { value: 'c00 角色週邊商品', text: 'c00 角色週邊商品（Character Merch）' },
    { value: 'c01 印刷品', text: 'c01 印刷品（Printed Matter）' },
    { value: 'c02 手工藝與配件', text: 'c02 手工藝與配件（Crafts & Accessories）' },
    { value: 'c03 布料與刺繡', text: 'c03 布料與刺繡（Fabric & Embroidery）' },
    { value: 'c04 刺青', text: 'c04 刺青（Tattoo）' },
    { value: 'c05 玩具與模型', text: 'c05 玩具與模型（Toy & Model）' },
    { value: 'c06 生活風格商品', text: 'c06 生活風格商品（Life Attitude）' },
    { value: 'c07 古董', text: 'c07 古董（Antiques）' },
    { value: 'c08 花藝・植栽・精品', text: 'c08 花藝・植栽・精品（Ikebana & Plant & Boutique）' },
    { value: 'c10 音樂', text: 'c10 音樂（Music）' }
  ],
  food: [
    { value: 'f00 甜點', text: 'f00 甜點（Desserts）' },
    { value: 'f01 飲品', text: 'f01 飲品（Beverages）' },
    { value: 'f02 鹹食', text: 'f02 鹹食（Savory Foods）' },
    { value: 'f03 茶・咖啡', text: 'f03 茶・咖啡（Tea & Coffee）' },
    { value: 'f04 醃製・發酵食品', text: 'f04 醃製・發酵食品（Pickled & Fermented Foods）' },
    { value: 'f05 糕點・烘焙食品', text: 'f05 糕點・烘焙食品（Pastries & Baked Goods）' },
    { value: 'f06 地方特色食品', text: 'f06 地方特色食品（Local Specialty Foods）' }
  ]
};

const mainSelect = document.getElementById('main-category');
const subSelect = document.getElementById('sub-category');
const hiddenSubCategoryInput = document.getElementById('hidden-sub-category');

mainSelect.addEventListener('change', function () {
  const selected = this.value;
  subSelect.innerHTML = '<option value="" disabled selected hidden>請選擇作品詳細類別 Please enter your sub-catagory</option>';

  if (subCategoryOptions[selected]) {
    subCategoryOptions[selected].forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.text;
      subSelect.appendChild(option);
    });
    subSelect.disabled = false;
  } else {
    subSelect.disabled = true;
  }
});

subSelect.addEventListener('change', function () {
  // When a sub-category is selected, update the hidden input value for submission to Google Form
  hiddenSubCategoryInput.value = this.value;
});