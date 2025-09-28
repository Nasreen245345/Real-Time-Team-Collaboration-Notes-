import React, { useState } from 'react'
import api from "../services/api"
import {useAuth} from '../context/auth.jsx'
import { useNavigate } from 'react-router-dom'
import {io} from 'socket.io-client'
const Login = () => {
//   const navigate=useNavigate()
  const {login,logout}=useAuth()
  const [formData,setFormData]=useState({email:'',password:''})
  const handleSubmit=async (e)=>{
    e.preventDefault()
    try{
      const res=await api.post("/auth/login",formData)
        alert("Login succesful")
        login(res.data.user,res.data.token)
        // navigate('/')

    }catch(err){
      if (err.response) {
        const message=err.response.data.message
      
    } else {
      alert("Something went wrong");
    }
      
    }

  }
  const handleChange=(e)=>{
    setFormData((prev)=>({...prev,[e.target.name]:e.target.value}))
  }
  return (
    <div className='w-full min-h-screen bg-gray-100 flex items-center justify-center '>
      <div className='w-full bg-[#ffffff] flex flex-col gap-2 p-6 m-20 rounded-lg sm:w-3/4 md:w-1/2 lg:w-1/4'>
      <h1 className='text-center font-bold text-2xl sm:text-3xl md:text-4xl '>Login</h1>
      <div className='text-center mb-3 text-ml font-normal'>Welcome backe to MiniReceipeFinder</div>
      <form className='flex flex-col gap-3' onSubmit={handleSubmit}>
        <label className='font-normal '>Email</label>
        <input
        name="email" 
        required
        value={formData.email}
        placeholder='Enter email'
        onChange={handleChange}
        className='rounded-md px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none'
        />
        <label className='font-normal '>password</label>
        <input
        name="password"
        required
        value={formData.password}
        placeholder='Enter password'
        onChange={handleChange}
        className=' border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none'
        />
        <button className='text-white text-center bg-orange-500 rounded-md mt-3 py-2 font-semibold text-sm sm:text-xl' type="submit">
        Submit
      </button>
      </form>
      <div className='text-center mt-2'>
        Dont have an account?
        <button className='text-orange-500 font-semibold ' onClick={()=>navigate("/signup")}>Signup</button>
      </div>

      </div>
       <button className='text-white text-center bg-orange-500 rounded-md mt-3 py-2 font-semibold text-sm sm:text-xl' onClick={logout}>
        Submit
      </button>
    </div>
  )
}

export default Login
