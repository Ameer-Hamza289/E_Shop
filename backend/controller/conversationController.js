const express=require("express")
const router=express.Router();
const ErrorHandler = require("../utils/ErrorHandler");
const Conversation = require("../model/conversation");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { isSeller, isAuthenticated } = require("../middleware/auth");

router.post("/create-new-conversation",catchAsyncErrors(async(req,res,next)=>{
    try {
        const { groupTitle, userId, sellerId } = req.body
        const isConversationExist = await Conversation.findOne({ groupTitle });
        if (isConversationExist) {
            const conversation = isConversationExist;
            res.status(201).json({
              success: true,
              conversation,
            });
          } else{
            const conversation = await Conversation.create({
                members: [userId, sellerId],
                groupTitle: groupTitle,
              });
      
              res.status(201).json({
                success: true,
                conversation,
              });
          }
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));   
    }
}))

router.post("/get-all-conversation-user/:id",isAuthenticated,catchAsyncErrors(async(req,res,next)=>{
    try {
        const conversations = await Conversation.find({
            members: {
              $in: [req.params.id],
            },
          }).sort({ updatedAt: -1, createdAt: -1 });
    
          res.status(201).json({
            success: true,
            conversations,
          })
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));   
    }
}))

router.get("/get-all-conversation-seller/:id", isSeller,catchAsyncErrors(async(req,res,next)=>{
    try {
        const conversations = await Conversation.find({
            members: {
              $in: [req.params.id],
            },
          }).sort({ updatedAt: -1, createdAt: -1 });
    
          res.status(201).json({
            success: true,
            conversations,
          })
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));   
    }
}))

router.post("/update-last-message/:id",catchAsyncErrors(async(req,res,next)=>{
    try {
        const { lastMessage, lastMessageId } = req.body;

        const conversation = await Conversation.findByIdAndUpdate(req.params.id, {
          lastMessage,
          lastMessageId,
        });
  
        res.status(201).json({
          success: true,
          conversation,
        })
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));   
    }
}))

module.exports=router