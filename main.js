// 監聽"PreferredBoothType"欄位的變化
document.addEventListener('DOMContentLoaded', function () {
    const boothTypeRadios = document.querySelectorAll('input[name="entry.133172086"]');
    const proposalLink = document.getElementById('proposalLink');
    const proposalLinkl = document.getElementById('proposalLink-l');
    const productLink = document.getElementById('productLink');
    const productLinkl = document.getElementById('productLink-l');
    const artworkUpload = document.getElementById('uploadArtwork');
    const artworkUploadl = document.getElementById('uploadArtwork-l');
    
    // 根據選擇的攤位類型顯示或隱藏元素
    function updateFormDisplay() {
        const selectedBoothType = document.querySelector('input[name="entry.133172086"]:checked');
        
        if (selectedBoothType) {
            const boothValue = selectedBoothType.value;
            
            // 裝置類
            if (boothValue === '裝置類') {
                proposalLink.style.display = 'block';
                productLink.style.display = 'none';
                artworkUpload.style.display = 'none';
                proposalLinkl.style.display = 'block';
                productLinkl.style.display = 'none';
                artworkUploadl.style.display = 'none';
            } else if (boothValue === '創作型商品' || boothValue === '食物酒水' || boothValue === '書攤') {
                proposalLink.style.display = 'none';
                productLink.style.display = 'block';
                artworkUpload.style.display = 'block';
                proposalLinkl.style.display = 'none';
                productLinkl.style.display = 'block';
                artworkUploadl.style.display = 'block';
            } else {
                // 預設隱藏
                proposalLink.style.display = 'none';
                productLink.style.display = 'none';
                artworkUpload.style.display = 'none';
                proposalLinkl.style.display = 'none';
                productLinkl.style.display = 'none';
                artworkUploadl.style.display = 'none';
            }
        }
    }

    // 監聽攤位類型的選擇改變事件
    boothTypeRadios.forEach(radio => {
        radio.addEventListener('change', updateFormDisplay);
    });

    // 初始更新
    updateFormDisplay();
});