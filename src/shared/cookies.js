// export function setCookies(cName, cValue, expiryTimeInMin) {
//   const expiryTime = new Date(new Date().getTime() + expiryTimeInMin * 1000);
//   const expires = `expires=${expiryTime.toString()};`;
//
//   console.log(cookie + expires + "path=/");
//   document.cookie = cookie + expires + "path=/";
//   console.log(document.cookie);
// }
//
// export function getCookies() {
//   const parseCookie = (str) =>
//     str
//       .split(";")
//       .map((equal) => equal.split("="))
//       .reduce((acc, v) => {
//         acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
//         return acc;
//       }, {});
//
//   console.log(parseCookie(document.cookie));
// }
