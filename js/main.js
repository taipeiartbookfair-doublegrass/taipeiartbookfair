// 監聽"PreferredBoothType"欄位的變化
document.addEventListener("DOMContentLoaded", function () {
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
  //const portdescription = document.getElementById("port-description");
  
  // 如果元素不存在（某些頁面可能沒有），則設為 null
  if (!proposalLink || !proposalLinkl || !productLink || !productLinkl || !artworkUpload || !artworkUploadl) {
    return; // 如果必要的元素不存在，直接返回
  }

  // 根據選擇的攤位類型顯示或隱藏元素
  function updateFormDisplay() {
    const selectedBoothType = document.querySelector(
      'input[name="entry.133172086"]:checked'
    );

    if (selectedBoothType) {
      const boothValue = selectedBoothType.value;

      // 裝置類：需要 Portfolio Upload + Proposal Plan
      if (boothValue === "裝置類") {
        proposalLink.style.display = "block";
        productLink.style.display = "none";
        artworkUpload.style.display = "block"; // Portfolio Upload 需要
        proposalLinkl.style.display = "block";
        productLinkl.style.display = "none";
        artworkUploadl.style.display = "block"; // Portfolio Upload 需要
        if (curationLink) curationLink.style.display = "none";
        if (curationLinkl) curationLinkl.style.display = "none";
        //portdescription.style.display = "none";
      } 
      // 書攤：需要 Product Description + Portfolio Upload
      else if (boothValue === "書攤") {
        proposalLink.style.display = "none";
        productLink.style.display = "block";
        artworkUpload.style.display = "block"; // Portfolio Upload 需要
        proposalLinkl.style.display = "none";
        productLinkl.style.display = "block";
        artworkUploadl.style.display = "block"; // Portfolio Upload 需要
        if (curationLink) curationLink.style.display = "none";
        if (curationLinkl) curationLinkl.style.display = "none";
        //portdescription.style.display = "block";
      } 
      // 非書（創作）攤：需要 Product Description + Portfolio Upload
      else if (boothValue === "創作商品") {
        proposalLink.style.display = "none";
        productLink.style.display = "block";
        artworkUpload.style.display = "block"; // Portfolio Upload 需要
        proposalLinkl.style.display = "none";
        productLinkl.style.display = "block";
        artworkUploadl.style.display = "block"; // Portfolio Upload 需要
        if (curationLink) curationLink.style.display = "none";
        if (curationLinkl) curationLinkl.style.display = "none";
        //portdescription.style.display = "none";
      } 
      // 食物酒水攤：只需要 Product Description，不需要 Portfolio Upload
      else if (boothValue === "食物酒水") {
        proposalLink.style.display = "none";
        productLink.style.display = "block";
        artworkUpload.style.display = "none"; // Portfolio Upload 不需要
        proposalLinkl.style.display = "none";
        productLinkl.style.display = "block";
        artworkUploadl.style.display = "none"; // Portfolio Upload 不需要
        if (curationLink) curationLink.style.display = "none";
        if (curationLinkl) curationLinkl.style.display = "none";
        //portdescription.style.display = "none";
      } 
      // 策展攤：需要 Portfolio Upload + Curation Booth Design Plan
      else if (boothValue === "策展攤") {
        proposalLink.style.display = "none";
        productLink.style.display = "none";
        artworkUpload.style.display = "block"; // Portfolio Upload 需要
        proposalLinkl.style.display = "none";
        productLinkl.style.display = "none";
        artworkUploadl.style.display = "block"; // Portfolio Upload 需要
        if (curationLink) curationLink.style.display = "block";
        if (curationLinkl) curationLinkl.style.display = "block";
      } 
      else {
        // 預設隱藏
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

  // 初始更新
  updateFormDisplay();
});
