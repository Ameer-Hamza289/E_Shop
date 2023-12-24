const User=require('../model/user')
const express=require("express")
const path=require("path")
const router=express.Router()
const {upload}=require("../multer")
const ErrorHandler=require("../utils/ErrorHandler")
const { v4: uuidv4 } = require('uuid');

router.post("/create-user", upload.single("file"),async(req,res,next)=>{
console.log("request");
    try{

        const {name,email,password,file}=req.body
        const userEmail=await User.findOne({email});
    
        if(userEmail){
            return next(new ErrorHandler("User already exists!", 400))
        }
    
        const fileUrl=path.join(file)
        // const fileUrl=path.join(filename)
        // const filename=req.file.filename
    
        const user= new User({
            name:name,
            email:email,
            password:password,
            avatar:{
                url:fileUrl,
                public_id:uuidv4()
            }
        })
        await user.save();
        res.status(201).json({ message: 'User created successfully' });


    }catch(err){
        console.log(err);
        next(new ErrorHandler('Internal server error', 500));
    }

})


module.exports=router