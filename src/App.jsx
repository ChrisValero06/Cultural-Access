import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { apiService } from './apis'
import { InstitucionesProvider } from './context/InstitucionesContext'
import Header from './components/Header'
import HeroSection from './components/HeroSection'
import BarraNaranja from './components/BarraNaranja'
import ContenidoPrincipal from './components/ContenidoPrincipal'
import Footer from './components/Footer'
import Redencion from './components/Formularios/Redencion'
import CargarPromo from './components/Formularios/CargarPromo'
import Registro from './components/Formularios/Registro'
import CargarPromoFunctional from './components/Formularios/CargarPromoFunctional'
import AdminDashboard from './components/Dashboard/AdminDashboard'
import Login from './components/Login'
import AvisoPrivacidad from './components/AvisoPrivacidad'
import PreguntasFrecuentes from './components/PreguntasFrecuentes'
import ReportesPage from './components/Reportes/ReportesPage'

function App() {
  const ProtectedRoute = ({ children }) => {
    const isAuthed = apiService.isAuthenticated()
    return isAuthed ? children : <Navigate to="/login" replace />
  }
  
  const ProtectedRegistroRoute = ({ children }) => {
    const isAuthed = apiService.isAuthenticated()
    if (!isAuthed) {
      return <Navigate to="/login" replace />
    }
    // Si es Pepe o Francisco, redirigir al AdminDashboard (Jose puede registrar)
    const perfilId = localStorage.getItem('perfilId')
    if (perfilId === 'pepe' || perfilId === 'francisco') {
      return <Navigate to="/AdminDashboard" replace />
    }
    return children
  }
  return (
    <InstitucionesProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/AdminDashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/reportes" element={<ProtectedRoute><ReportesPage /></ProtectedRoute>} />
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
                <Route path="/Redencion" element={
                  <Redencion />
                } />
                <Route path="/redencion" element={
                  <Redencion />
                } />
                <Route path="/Rendencion" element={
                  <Redencion />
                } />
                <Route path="/Rendencion" element={
                  <Redencion />
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
                  <ProtectedRegistroRoute><Registro /></ProtectedRegistroRoute>
                } />
                <Route path="/registro" element={
                  <ProtectedRegistroRoute><Registro /></ProtectedRegistroRoute>
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
