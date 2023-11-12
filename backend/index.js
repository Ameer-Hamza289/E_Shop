const express=require('express')
const mongoose=require('mongoose')
const ErrorHandler = require('./utils/ErrorHandler')
const app=express()
require('dotenv').config()
const cookieParser=require("cookie-parser")
const bodyParser=require("body-parser")
const cors=require("cors")


app.use(express.json());
app.use(cookieParser())
app.use(cors());
app.use("/",express.static("uploads"))
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

//import routes
const user=require('./controller/userController')
app.use('/api/v2',user)



//exceptions
process.on("uncaughtException",(err)=>{
    console.log(`Error:${err.message}`);
    console.log("Shutting down server for handling uncaught exception");
})

app.use( ErrorHandler);

app.listen(process.env.PORT,()=>console.log(`Server listening at  port ${process.env.PORT}`))

mongoose.connect(process.env.URI)
.then(()=>console.log("MongoDB connected successfully!"))
.catch((err)=>console.log(`Error:${err.message}`))

process.on("unhandledRejection",(err)=>{
    console.log(`Shutting down server for ${err.message}`);

    app.close(()=>{
        process.exit(1)
    })
})