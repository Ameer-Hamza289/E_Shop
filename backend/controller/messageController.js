const express=require("express")
const router=express.Router();
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");



router.post("/",catchAsyncErrors(async(req,res,next)=>{
    try {
        
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));   
    }
}))




module.exports=router