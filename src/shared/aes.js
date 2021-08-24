const aes256 = require("aes256");
const secretKey = "secret_key";

export const toEncrypt = (string) => {
  return aes256.encrypt(secretKey, string);
};

export const toDecrypt = (cipher) => {
  // if (cipher.startWith("Welcome")) return cipher;
  return aes256.decrypt(secretKey, cipher);
};
