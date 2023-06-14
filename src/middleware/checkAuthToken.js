const checkXAuthToken = async(req,res,next)=>{
    try {
        const token = req.header("X-AUTH-TOKEN");
        console.log(token);
        next();       
    } catch (error) {
        console.log(error);
        res.status(400).send({error:"Please pass the token"});

    }
}

module.exports = checkXAuthToken;