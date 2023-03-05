const jwtKey = "YOUR-SECRET-KEY",
      jwtIss = "ADMIN",
      jwtAlgo = "HS512";
const jwt = require("jsonwebtoken")


jwtSign = username => {
  let char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789~!@#$%^&_-", rnd = "";
  for (let i=0; i<16; i++) {
    rnd += char.charAt(Math.floor(Math.random() * char.length));
  }
 
  let now = Math.floor(Date.now() / 1000);
 

  return jwt.sign({
    iat : now, 
    nbf : now, 
    exp : now + 3600, 
    jti : rnd, 
    iss : jwtIss, 
    data : { username : username } 
  }, jwtKey, { algorithm: jwtAlgo });
};
module.exports = jwtSign