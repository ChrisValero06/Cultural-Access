import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import HeroSection from './components/HeroSection'
import BarraNaranja from './components/BarraNaranja'
import ContenidoPrincipal from './components/ContenidoPrincipal'
import Footer from './components/Footer'
import Formulario from './components/Formularios/Control_Acceso'
import CargarPromo from './components/Formularios/CargarPromo'
import Registro from './components/Formularios/Registro'
import AdminDashboard from './components/Dashboard/AdminDashboard'
import AvisoPrivacidad from './components/AvisoPrivacidad'
import PreguntasFrecuentes from './components/PreguntasFrecuentes'

function App() {
  return (
    <>
      <Routes>
        <Route path="/AdminDashboard" element={
          <AdminDashboard />
        } />
        <Route path="/*" element={
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
                <Route path="/CargarPromo" element={
                  <CargarPromo />
                } />
                <Route path="/Registro" element={
                  <Registro />
                } />
                <Route path="/privacidad" element={
                  <AvisoPrivacidad />
                } />
                <Route path="/PreguntasFrecuentes" element={
                  <PreguntasFrecuentes />
                } />
              </Routes>
            </main>
            <Footer />
          </>
        } />
      </Routes>
    </>
  )
}

export default App
