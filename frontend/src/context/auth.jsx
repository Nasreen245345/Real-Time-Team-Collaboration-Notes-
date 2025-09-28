import React,{useContext,createContext,useState,useEffect} from 'react'
import { disconnectSocket } from "../services/socket";
import api from '../services/api'
//createcontext
const AuthContext=createContext()
//provider
export const AuthProvider=({children})=>{
    const [user,setUser]=useState(null)
    const [token,setToken]=useState(null)
    useEffect(() => {
        const savedUser=localStorage.getItem('token')
        const savedToken=localStorage.getItem('token')
        if(savedUser && savedToken){
            setToken(savedToken)
            setUser(savedUser)
        }
      
    },[])
    
const login=(userData,userToken)=>{
    setToken(userToken)
        setUser(userData)
localStorage.setItem('user',userData)
localStorage.setItem('token',userToken)
}
    const logout=()=>{
        setToken(null)
        setUser(null)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
    }
    return(
        <AuthContext.Provider value={{logout,login,user,token}}>
            {children}
        </AuthContext.Provider>
    )
}
//custome hook to use context
export const useAuth=()=>{
    const context=useContext(AuthContext)
    if(!context){
        throw new Error("useAuth must be within Authprovider")
    }
    return context;
}