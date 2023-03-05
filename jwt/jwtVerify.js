const jwtKey = "YOUR-SECRET-KEY"
const jwt = require("jsonwebtoken")
jwtVerify = (res,cookies) => {
  
  if (cookies?.JWT===undefined) { return false; }

  try {
    let decoded = jwt.verify(cookies.JWT, jwtKey);
    res.cookie('TWILIO_APP_USER',decoded.data.username)
    return true;
  } catch (err) {console.log(err); return false; }


}
module.exports = jwtVerify