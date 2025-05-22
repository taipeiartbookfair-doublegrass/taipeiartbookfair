// // Helper to get a cookie value by name
// function getCookie(name) {
//   const value = `; ${document.cookie}`;
//   const parts = value.split(`; ${name}=`);
//   if (parts.length === 2) return parts.pop().split(";").shift();
//   return null;
// }

// // Check for both 'account' and 'region' cookies
// const account = getCookie("account");
// const region = getCookie("region");

// if (!account || !region) {
//   // Redirect to login page if either is missing
//   window.location.href = "login.html";
// }

document.addEventListener("DOMContentLoaded", function () {
  const nat = document.getElementById("nationality");
  const visa = document.getElementById("visa-requirement");
  if (!nat || !visa) return;
  const value = nat.textContent.trim().toUpperCase();

  if (value === "TW") {
    visa.innerHTML = "Not Require";
  } else if (value === "CN") {
    visa.innerHTML = `<a href="download/requirement-form-cn.pdf" target="_blank" style="color:blue;text-decoration:underline;">Download the requirement form</a>`;
  } else {
    visa.innerHTML = `
      <a href="https://visawebapp.boca.gov.tw/BOCA_EVISA/MRV01FORM.do" target="_blank" style="color:blue;text-decoration:underline;">
        Apply for Taiwan eVisa
      </a>
      <br>
      <a href="download/visa-info.pdf" target="_blank" style="color:blue;text-decoration:underline;">
        Download visa information
      </a>
    `;
  }
});
