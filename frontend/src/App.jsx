import { useState } from 'react'
import './App.css'
import {Routes,Route} from 'react-router-dom'
import Login from "./pages/Login"
import Register from './pages/Register'


function App() {
return (
    <>
    <Routes>
       <Route path='/' element={ <Login/>}/>
      <Route path='/login' element={ <Login/>}/>
      <Route path='/signup' element={ <Register/>}/>
    </Routes>
    </>
  )
}
export default App
