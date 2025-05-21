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
