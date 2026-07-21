// Contact section — fetches content from GAS and populates contact-section-1 / 2
// contactApiUrl is defined in dashboard-basic.js (must load first)

function processContactText(raw) {
  let html = raw
    .replace(/\n/g, "<br>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/_(.*?)_/g, "<em>$1</em>");

  const temp = document.createElement("div");
  temp.innerHTML = html;
  const walker = document.createTreeWalker(temp, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  let node;
  while ((node = walker.nextNode())) textNodes.push(node);
  textNodes.forEach((textNode) => {
    if (!/(https?:\/\/)/.test(textNode.nodeValue)) return;
    const span = document.createElement("span");
    span.innerHTML = textNode.nodeValue.replace(
      /(https?:\/\/[^\s<>"]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );
    textNode.parentNode.replaceChild(span, textNode);
  });
  return temp.innerHTML;
}

document.addEventListener("DOMContentLoaded", async function () {
  if (typeof contactApiUrl === "undefined" || !contactApiUrl) return;
  try {
    const res  = await fetch(contactApiUrl, { redirect: "follow" });
    const data = await res.json();
    console.log("[contact API]", data);
    const s1 = document.getElementById("contact-section-1");
    const s2 = document.getElementById("contact-section-2");
    if (s1 && data["contact-section-1"])
      s1.innerHTML = processContactText(data["contact-section-1"]);
    if (s2 && data["contact-section-2"])
      s2.innerHTML = processContactText(data["contact-section-2"]);
  } catch (e) {
    console.warn("[contact API] Failed:", e);
  }
});
