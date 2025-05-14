const etherpadUrl =
  "https://pad.riseup.net/p/r.86bfc61ba2b07934807ac87259c8242d/export/txt";

fetch(etherpadUrl)
  .then((res) => res.text())
  .then((text) => {
    // 處理格式
    let formatted = text
      // 加粗 **文字** → <strong>
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      // 斜體 *文字* → <em>
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      // 刪除線 ~~文字~~ → <del>
      .replace(/~~(.*?)~~/g, "<del>$1</del>")
      // 顏色 {顏色} 文字 → <span style="color: 顏色">文字</span>
      .replace(/\{(.*?)\}(.*?)(?=\n|\r|$)/g, (match, color, text) => {
        return `<span style="color: ${color}">${text}</span>`;
      })
      // 小字 {small}文字{small} → <small>
      .replace(/\{small\}(.*?)\{small\}/g, "<small>$1</small>")
      // 換行 \n → <br />
      .replace(/\n/g, "<br />");

    // 顯示處理後的內容
    document.getElementById("info-log").innerHTML = formatted;
  })
  .catch((err) => {
    document.getElementById("info-log").innerText = "讀取失敗：" + err.message;
  });
