import React,{useState} from 'react'
import {AiOutlineEye, AiOutlineEyeInvisible} from 'react-icons/ai'
import styles from '../styles/styles'
import {Link} from 'react-router-dom'
import { RxAvatar } from "react-icons/rx";
import { server } from '../server';
import axios from 'axios';
import { toast } from 'react-toast';


 const SignUp = () => {
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [name,setName]=useState('');
  const [visible,setVisible]=useState()
  const [avatar,setAvatar]=useState(null)

  

  const handleFileInputChange = (e) =>{
    const reader = new FileReader()

    reader.onload=()=>{
      if(reader.readyState===2){
        setAvatar(reader.result)
      }
    }

    reader.readAsDataURL(e.target.files[0])
  }

  const handleSubmit = async(e)=>{
    
    e.preventDefault();
    const config={ headers:{"Content-Type":"multipart/form-data"}}

    const newForm=new FormData();
    newForm.append("file",avatar)
    newForm.append("name",name)
    newForm.append("email",email)
    newForm.append("password",password)

    axios.post(`${server}/api/v2/create-user`,newForm, config)
    
    .then((res)=>{
      toast.success(res.data.message);
      setName("");
      setEmail("");
      setPassword("");
      setAvatar();
    })
    .catch((err)=>{
      toast.error(err.message)
    })
  }


  return (
    <div className='min-h-screen bg-grey-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
        <div className='sm:mx-auto sm:w-full sm:max-w-md'>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
            Register as a new user 
          </h2>
        </div>
        <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
          <div className=' bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10'>
            <form  className='space-y-6' onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className='block text-sm font-medium text-gray-700'>Full Name</label>
              <div className="mt-1">
                <input type="text" name="name" id="" autoComplete='name' required value={name} className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500' onChange={(e)=>setName(e.target.value)} />
              </div>
              </div>
              <div>
                <label htmlFor="email" className='block text-sm font-medium text-gray-700'>Email Address</label>
              <div className="mt-1">
                <input type="email" name="email" id="" autoComplete='email' required value={email} className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500' onChange={(e)=>setEmail(e.target.value)} />
              </div>
              </div>
              <div>
                <label htmlFor="password" className='block text-sm font-medium text-gray-700'>Password</label>
              <div className="mt-1 relative">

              <input type={visible?"text":"password"} name="password" id="" autoComplete='current-password' required value={password} className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500' onChange={(e)=>setPassword(e.target.value)} />
             {visible?
             <AiOutlineEye className=" absolute right-2 top-2 cursor-pointer" size={25} onClick={()=>setVisible(false)}/>
            :
            <AiOutlineEyeInvisible className='absolute right-2 top-2 cursor-pointer' size={25} onClick={()=>setVisible(true)}/>
            }
              </div>
              </div>
            
              <div>
              <label
                htmlFor="avatar"
                className="block text-sm font-medium text-gray-700"
              ></label>
              <div className="mt-2 flex items-center">
                <span className="inline-block h-8 w-8 rounded-full overflow-hidden">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="avatar"
                      className="h-full w-full object-cover rounded-full"
                    />
                  ) : (
                    <RxAvatar className="h-8 w-8" />
                  )}
                </span>
                <label
                  htmlFor="file-input"
                  className="ml-5 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <span className='cursor-pointer'>Upload a file</span>
                  <input
                    type="file"
                    name="avatar"
                    id="file-input"
                    accept=".jpg,.jpeg,.png"
                    onChange={handleFileInputChange}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>          
             
              <div>
              <button
                type="submit"
                className="group relative w-full h-[40px] flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Submit
              </button>
            </div>
            <div className={`${styles.noramlFlex} w-full`}>
              <h4>Already have an account?</h4>
              <Link to="/sign-up" className="text-blue-600 pl-2">
                Login
              </Link>
            </div>
            </form>

          </div>

        </div>
    </div>
  )
}

export default SignUp