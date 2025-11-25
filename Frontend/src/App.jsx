import { useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Navbar from './shared/navbar'

function Home() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Navbar></Navbar>
    </>
  )
}

function About() {
  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>Sobre</h1>
      <p>Esta é uma página de exemplo adicionada com React Router Dom.</p>
      <Link to="/">Voltar para Home</Link>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
    </Routes>
  )
}

export default App
