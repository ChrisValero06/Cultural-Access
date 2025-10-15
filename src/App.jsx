import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { apiService } from './apis'
import { InstitucionesProvider } from './context/InstitucionesContext'
import Header from './components/Header'
import HeroSection from './components/HeroSection'
import BarraNaranja from './components/BarraNaranja'
import ContenidoPrincipal from './components/ContenidoPrincipal'
import Footer from './components/Footer'
import Formulario from './components/Formularios/Control_Acceso'
import CargarPromo from './components/Formularios/CargarPromo'
import Registro from './components/Formularios/Registro'
import CargarPromoFunctional from './components/Formularios/CargarPromoFunctional'
import AdminDashboard from './components/Dashboard/AdminDashboard'
import Login from './components/Login'
import AvisoPrivacidad from './components/AvisoPrivacidad'
import PreguntasFrecuentes from './components/PreguntasFrecuentes'

function App() {
  return (
    <InstitucionesProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/AdminDashboard" element={
          apiService.isAuthenticated() ? <AdminDashboard /> : <Navigate to="/login" replace />
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
                <Route path="/control_acceso" element={
                  <Formulario />
                } />
                <Route path="/CargarPromo" element={
                  <CargarPromo />
                } />
                <Route path="/cargarpromo" element={
                  <CargarPromo />
                } />
                <Route path="/CargarPromoFunctional" element={
                  <CargarPromoFunctional />
                } />
                <Route path="/cargarpromo-functional" element={
                  <CargarPromoFunctional />
                } />
                <Route path="/Registro" element={
                  <Registro />
                } />
                <Route path="/registro" element={
                  <Registro />
                } />
                <Route path="/privacidad" element={
                  <AvisoPrivacidad />
                } />
                <Route path="/PreguntasFrecuentes" element={
                  <PreguntasFrecuentes />
                } />
                <Route path="/preguntasfrecuentes" element={
                  <PreguntasFrecuentes />
                } />
              </Routes>
            </main>
            <Footer />
          </>
        } />
      </Routes>
    </InstitucionesProvider>
  )
}

export default App
