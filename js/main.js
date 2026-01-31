// 監聽"PreferredBoothType"欄位的變化，根據攤位類型顯示/隱藏 Portfolio Upload、Product Description 等區塊
var boothTypeDisplayInited = false;
function initBoothTypeDisplay() {
  if (boothTypeDisplayInited) return;
  boothTypeDisplayInited = true;
  const boothTypeRadios = document.querySelectorAll(
    'input[name="entry.133172086"]'
  );
  const proposalLink = document.getElementById("proposalLink");
  const proposalLinkl = document.getElementById("proposalLink-l");
  const productLink = document.getElementById("productLink");
  const productLinkl = document.getElementById("productLink-l");
  const artworkUpload = document.getElementById("uploadArtwork");
  const artworkUploadl = document.getElementById("uploadArtwork-l");
  const curationLink = document.getElementById("curationLink");
  const curationLinkl = document.getElementById("curationLink-l");

  // 如果元素不存在（某些頁面可能沒有），則直接返回
  if (!proposalLink || !proposalLinkl || !productLink || !productLinkl || !artworkUpload || !artworkUploadl) {
    return;
  }

  // 根據選擇的攤位類型顯示或隱藏元素
  // 支援中文（本地表單）與英文（海外表單 oversea_20251218_invite.html）攤位類型
  function updateFormDisplay() {
    const selectedBoothType = document.querySelector(
      'input[name="entry.133172086"]:checked'
    );

    if (selectedBoothType) {
      const boothValue = selectedBoothType.value;

      // 裝置類 / Installation Booth：需要 Portfolio Upload + Proposal Plan
      if (boothValue === "裝置類" || boothValue === "Installation Booth") {
        proposalLink.style.display = "block";
        productLink.style.display = "none";
        artworkUpload.style.display = "block";
        proposalLinkl.style.display = "block";
        productLinkl.style.display = "none";
        artworkUploadl.style.display = "block";
        if (curationLink) curationLink.style.display = "none";
        if (curationLinkl) curationLinkl.style.display = "none";
      }
      // 書攤 / Regular Book Booth：需要 Product Description + Portfolio Upload（含條件式錄取說明）
      else if (boothValue === "書攤" || boothValue === "Regular Book Booth") {
        proposalLink.style.display = "none";
        productLink.style.display = "block";
        artworkUpload.style.display = "block";
        proposalLinkl.style.display = "none";
        productLinkl.style.display = "block";
        artworkUploadl.style.display = "block";
        if (curationLink) curationLink.style.display = "none";
        if (curationLinkl) curationLinkl.style.display = "none";
      }
      // 非書（創作）攤 / Regular Non-Book Booth：需要 Product Description + Portfolio Upload
      else if (boothValue === "創作商品" || boothValue === "Regular Non-Book Booth") {
        proposalLink.style.display = "none";
        productLink.style.display = "block";
        artworkUpload.style.display = "block";
        proposalLinkl.style.display = "none";
        productLinkl.style.display = "block";
        artworkUploadl.style.display = "block";
        if (curationLink) curationLink.style.display = "none";
        if (curationLinkl) curationLinkl.style.display = "none";
      }
      // 食物酒水攤：只需要 Product Description，不需要 Portfolio Upload
      else if (boothValue === "食物酒水") {
        proposalLink.style.display = "none";
        productLink.style.display = "block";
        artworkUpload.style.display = "none";
        proposalLinkl.style.display = "none";
        productLinkl.style.display = "block";
        artworkUploadl.style.display = "none";
        if (curationLink) curationLink.style.display = "none";
        if (curationLinkl) curationLinkl.style.display = "none";
      }
      // 策展攤 / Curation Booth：需要 Portfolio Upload + Curation Booth Design Plan
      else if (boothValue === "策展攤" || boothValue === "Curation Booth") {
        proposalLink.style.display = "none";
        productLink.style.display = "none";
        artworkUpload.style.display = "block";
        proposalLinkl.style.display = "none";
        productLinkl.style.display = "none";
        artworkUploadl.style.display = "block";
        if (curationLink) curationLink.style.display = "block";
        if (curationLinkl) curationLinkl.style.display = "block";
      }
      else {
        proposalLink.style.display = "none";
        productLink.style.display = "none";
        artworkUpload.style.display = "none";
        proposalLinkl.style.display = "none";
        productLinkl.style.display = "none";
        artworkUploadl.style.display = "none";
        if (curationLink) curationLink.style.display = "none";
        if (curationLinkl) curationLinkl.style.display = "none";
      }
    }
  }

  // 監聽攤位類型的選擇改變事件
  boothTypeRadios.forEach((radio) => {
    radio.addEventListener("change", updateFormDisplay);
  });

  // 初始更新（一載入就根據目前選項顯示對應區塊）
  updateFormDisplay();
}

document.addEventListener("DOMContentLoaded", initBoothTypeDisplay);
// 若腳本在 body 底載入，DOM 可能已就緒，DOMContentLoaded 可能已觸發，故額外檢查並執行一次
if (document.readyState !== "loading") {
  initBoothTypeDisplay();
}
