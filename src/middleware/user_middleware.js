const userMiddleware = (req, res, next) =>{
    console.log("middleware user", req.path)
    next();
}
module.exports = userMiddleware;