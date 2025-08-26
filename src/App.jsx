import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import HeroSection from './components/HeroSection'
import BarraNaranja from './components/BarraNaranja'
import ContenidoPrincipal from './components/ContenidoPrincipal'
import Footer from './components/Footer'
import Formulario from './components/Formularios/Control_Acceso'

function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={
            <div>
              <HeroSection />
              <BarraNaranja />
              <ContenidoPrincipal />
            </div>
          } />
          <Route path="/Control_Acceso" element={
            <Formulario />
          } />
          {/* Add more routes here as needed */}
        </Routes>
      </main>
      <Footer />
    </>
  )
}

export default App
