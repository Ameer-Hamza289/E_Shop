const User=require('../model/user')
const express = require("express")
const path=require("path")
const router=express.Router()
const {upload}=require("../multer")
const ErrorHandler=require("../utils/ErrorHandler")
const { v4: uuidv4 } = require('uuid');
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail");
const sendToken = require("../utils/jwtToken");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
// const cloudinary = require("cloudinary");
const fs=require("fs");



const createActivationToken=(user)=>{
    return jwt.sign(user,process.env.ACTIVATION_SECRET,{
        expiresIn:'5m'
    })
}

router.post("/create-user",upload.single("file") , async (req, res, next) => {
    try {
      const { name, email, password } = req.body;
      // console.log(req);
      // console.log(req.body,"req");
      const userEmail = await User.findOne({ email });
  
      if (userEmail) {
        const filename = req.file.filename;
        const filePath = `uploads/${filename}`;
        fs.unlink(filePath, (err) => {
          if (err) {
            console.log(err);
            res.status(500).json({ message: "Error deleting file" });
          }
        });
        return next(new ErrorHandler("User already exist", 400));
      }
      // var buffer=newBUffer(req.files.file.data);
      // var file=req.files.file.data
      // console.log(file,"file");
      // const myCloud = await cloudinary.v2.uploader.upload(file, {
      //   folder: "avatars",
      // });
      const filename = req.file.filename;
      const fileUrl = path.join(filename);

    // console.log(myCloud,"cloud");
  
      const user ={
        name: name,
        email: email,
        password: password,
        avatar:fileUrl
        // avatar: {
        //   public_id: myCloud.public_id,
        //   url: myCloud.secure_url,
        // },
        
      };
  // await user.save();
      const activationToken = createActivationToken(user);
  
      const activationUrl = `http://localhost:3000/activation/${activationToken}`;
  
      try {
        await sendMail({
          email: user.email,
          subject: "Activate your account",
          message: `Hello ${user.name}, please click on the link to activate your account: ${activationUrl}`,
        });
        res.status(201).json({
          success: true,
          message: `please check your email:- ${user.email} to activate your account!`,
        });
      } catch (error) {
        return next(new ErrorHandler(error.message, 500));
      }
    } catch (error) {
      // console.log(error);
      return next(new ErrorHandler(error.message, 400));
    }
  });

router.post("/register", upload.single("file"),async(req,res,next)=>{
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
        // await user.save();
        // res.status(201).json({ message: 'User created successfully' });
        const activationToken = createActivationToken(user);
        const activationUrl = `http://localhost:3000/activation/${activationToken}`;
        try {

            await sendMail({
                email:user.email,
                subject:"Welcome to EShop! : Activate your account",
                message:`Hello ${user.name}, please click on the link to activate your account: ${activationUrl}`
            })

            res.status(201).json({
                success: true,
                message: `please check your email:- ${user.email} to activate your account!`,
              });

        } catch (error) {
             return next(new ErrorHandler(error.message, 500));
        }      

    }catch(err){
        console.log(err);
       return next(new ErrorHandler(err.message, 400));
    }

});

router.post('/activation',catchAsyncErrors(async(req,res,next)=>{
    try {
        const {activation_token}=req.body
        // console.log(activation_token,"token");
        // console.log(req);
        const newUser=jwt.verify(
          activation_token,
        process.env.ACTIVATION_SECRET
        )
        if(!newUser){
            return next(new ErrorHandler("Invalid token", 400));
        }
        const { name, email, password, avatar } = newUser;
        let user=await User.findOne({email})
        if(user){
            return next(new ErrorHandler("User already exists", 400));
        }
        user = await User.create({
            name,
            email,
            avatar,
            password,
          });
          sendToken(user,201,res)

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}));

router.post("/login-user",catchAsyncErrors(async(req,res,next)=>{
    try {
        const {email,password}=req.body

        if (!email || !password) {
            return next(new ErrorHandler("Please provide the all fields!", 400));
          }

        const user=await User.findOne({email}).select("+password");
        if (!user) {
            return next(new ErrorHandler("User doesn't exists!", 400));
          }

        const isPasswordValid = await user.comparePassword(password);
        if(!isPasswordValid){
            return next(
                new ErrorHandler("Please provide the correct information", 400)
              );
        }

        sendToken(user, 201, res);

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));

    }
}));

router.get("/get-user",isAuthenticated, catchAsyncErrors(async(req,res,next)=>{
    try {
        const user=await User.findById(req.user.id)
        if(!user){
            return next(new ErrorHandler("User doesn't exists", 400));
        }
        res.status(200).json({
            success:true,
            user
        })
    } catch (error) {
        return next(new ErrorHandler(error.message,500))
    }
}));

router.get('/logout',catchAsyncErrors(async(req,res,next)=>{
    try {
        res.cookie("token",null,{
            expires:new Date(Date.now()),
            httpOnly:true,
            samSite:true,
            secure:true
        })
        
        res.status(201).json({
            success:true,
            message:"Log out Successful!"
        })
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }

}));

router.put("/update-user-info",isAuthenticated,catchAsyncErrors(async(req,res,next)=>{
    try {
        const { email, password, phoneNumber, name } = req.body;
        const user = await User.findOne({ email }).select("+password");

      if (!user) {
        return next(new ErrorHandler("User not found", 400));
      }

      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return next(
          new ErrorHandler("Please provide the correct information", 400)
        );
      }
      user.name = name;
      user.email = email;
      user.phoneNumber = phoneNumber;

      await user.save();
      res.status(201).json({
        success:true,
        user
      })
        
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}));

router.post('/update-avatar/:userId', upload.single('file'), async (req, res, next) => {
    try {
      const userId = req.params.userId;
      const user = await User.findById(userId);
  
      if (!user) {
        return next(new ErrorHandler('User not found!', 404));
      }
  
      // Update the avatar information
      user.avatar.url = path.join(req.file.path);
      user.avatar.public_id = uuidv4();
  
      // Save the updated user
      await user.save();
  
      res.status(200).json({
        success: true,
        message: 'Avatar updated successfully!',
        user: user,
      });
    } catch (err) {
      console.error(err);
      return next(new ErrorHandler(err.message, 400));
    }
  });

router.put("/update-avatar",isAuthenticated,catchAsyncErrors(async(req,res,next)=>{
    try {
        let existsUser = await User.findById(req.user.id);
        if(req.body.avatar!== ""){
            const imageId=existsUser.avatar.public_id;
            // await cloudinary.v2.uploader.destroy(imageId);
            // const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
            //     folder: "avatars",
            //     width: 150,
            //   });

            //   existsUser.avatar = {
            //     public_id: myCloud.public_id,
            //     url: myCloud.secure_url,
            //   };
            const existsAvatarPath = `uploads/${existsUser.avatar}`;
            fs.unlinkSync(existsAvatarPath);
            const fileUrl = path.join(req.file.filename);
      
            const user = await User.findByIdAndUpdate(req.user.id, {
              avatar: fileUrl,
            });
            }
        // await existsUser.save();
        res.status(200).json({
            success: true,
            user: user,
          });
        }
     catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}));

router.put("/update-user-addresses",isAuthenticated,catchAsyncErrors(async(req,res,next)=>{
    try {
        const user = await User.findById(req.user.id);
        const sameTypeAddress = user.addresses.find(
            (address) => address.addressType === req.body.addressType
          );
        if(sameTypeAddress){
            return next(
                new ErrorHandler(`${req.body.addressType} address already exists`)
              );
        }
        const existsAddress = user.addresses.find(
            (address) => address._id === req.body._id
          );
    
          if (existsAddress) {
            Object.assign(existsAddress, req.body);
          } else {
            // add the new address to the array
            user.addresses.push(req.body);
          }
    
          await user.save();
    
          res.status(200).json({
            success: true,
            user,
          });
        
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}));

router.delete("delete-user-address/:id",isAuthenticated,catchAsyncErrors(async(req,res,next)=>{
    try {
        const userId = req.user._id;
        const addressId = req.params.id;
        await User.updateOne(
            {
                _id:userId
            },
            {
                $pull:{
                    addresses:{
                        _id:addressId
                    }
                }
            }
        );
        const user = await User.findById(userId);
        res.status(200).json({
             success: true,
              user
             });
          
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}));

router.put("/update-user-password", isAuthenticated,catchAsyncErrors(async(req,res,next)=>{
    try {
        const user = await User.findById(req.user.id).select("+password");
        const isPasswordMatched = await user.comparePassword(
            req.body.oldPassword
          );
          if (!isPasswordMatched) {
            return next(new ErrorHandler("Old password is incorrect!", 400));
          }
          if (req.body.newPassword !== req.body.confirmPassword) {
            return next(
              new ErrorHandler("Password doesn't matched with each other!", 400)
            );
          }
          user.password = req.body.newPassword
          await user.save();

      res.status(200).json({
        success: true,
        message: "Password updated successfully!",
      });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}));

router.get("/user-info/:id",catchAsyncErrors(async (req, res, next) => {
      try {
        const user = await User.findById(req.params.id);
  
        res.status(201).json({
          success: true,
          user,
        });
      } catch (error) {
        return next(new ErrorHandler(error.message, 500));
      }
    })
  );

router.get("/admin-all-users",isAuthenticated,isAdmin("Admin"),catchAsyncErrors(async(req,res,next)=>{
    try {
        const users = await User.find().sort({
            createdAt: -1,
          })
          res.status(201).json({
            success: true,
            users,
          })
        
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}));

router.delete( "/delete-user/:id", isAuthenticated, isAdmin("Admin"), catchAsyncErrors(async (req, res, next) => {
      try {
        const user = await User.findById(req.params.id);

        if (!user) {
          return next(new ErrorHandler("User not found!", 400));
        }
  
        await User.findByIdAndDelete(req.params.id);
  
        res.status(201).json({
          success: true,
          message: "User deleted successfully!",
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
      }
}));


module.exports=router;