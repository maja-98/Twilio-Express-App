const  jwtVerify = require('../jwt/jwtVerify')
const authorize = (req,res,next) => {
      
    if (jwtVerify(res,req.cookies)) {
      if (req.url==='/'){
            res.redirect('/admin')
      }
        next()
  } else {
      if (req.url!=='/'){
        res.redirect("/")
      }
      next()
  }
}
module.exports = authorize