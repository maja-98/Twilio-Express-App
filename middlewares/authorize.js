const  jwtVerify = require('../jwt/jwtVerify')
const authorize = (req,res,next) => {
      
    if (jwtVerify(res,req.cookies)) {
      if (req.url==='/'){
            return res.redirect('/admin')
      }
        next()
  } else {
      if (req.url!=='/'){
        return res.redirect("/")
      }
      next()
  }
}
module.exports = authorize