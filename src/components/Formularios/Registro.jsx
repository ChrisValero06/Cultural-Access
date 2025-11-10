"use client"

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiService } from '../../apis'
import { imagenes } from '../../constants/imagenes'

const RadioButton = ({ id, name, value, checked, onChange, label, disabled, required = false }) => (
  <div className="flex items-center space-x-2">
    <input type="radio" id={id} name={name} value={value} checked={checked} onChange={onChange}
      className="w-4 h-4 text-orange-500 border-orange-400 bg-transparent focus:ring-orange-600 focus:ring-2"
      disabled={disabled} required={required} />
    <label htmlFor={id} className="text-white text-sm">{label}</label>
  </div>
)

const TextInput = ({ id, name, type = "text", autoComplete, value, onChange, placeholder, required = false, disabled = false, maxLength, pattern, className = "" }) => (
  <input type={type} id={id} name={name} autoComplete={autoComplete} value={value} onChange={onChange}
    placeholder={placeholder} required={required} disabled={disabled} maxLength={maxLength} pattern={pattern}
    className={`w-full px-4 py-3 border-2 border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent transition duration-200 bg-white text-black text-base placeholder:text-gray-500 uppercase ${className}`} />
)

const SelectInput = ({ id, name, autoComplete, value, onChange, required = false, disabled = false, children }) => (
  <div className="relative">
    <select id={id} name={name} autoComplete={autoComplete} value={value} onChange={onChange}
      required={required} disabled={disabled}
      className="w-full px-4 py-3 border-2 border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent transition duration-200 bg-white text-base appearance-none text-black uppercase">
      {children}
    </select>
    <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-orange-600 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </div>
)

const CulturalAccessForm = () => {
  const navigate = useNavigate()
  const [curpOption, setCurpOption] = useState("curp")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tarjetaValidando, setTarjetaValidando] = useState(false)
  const [tarjetaDisponible, setTarjetaDisponible] = useState(null)

  // Proteger el formulario - solo usuarios autenticados pueden acceder
  useEffect(() => {
    // Verificar autenticación
    if (!apiService.isAuthenticated()) {
      navigate('/login')
      return
    }
    
    // Si es Pepe, redirigir al AdminDashboard (Jose puede registrar)
    const perfilId = localStorage.getItem('perfilId')
    if (perfilId === 'pepe') {
      navigate('/AdminDashboard')
      return
    }
  }, [navigate])

  // Limpiar sesión cuando el usuario sale de la página o presiona atrás
  useEffect(() => {
    const limpiarSesion = () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userUsuario');
      localStorage.removeItem('perfilId');
      localStorage.removeItem('perfilNombre');
    }

    // Detectar cuando el usuario sale de la página (cierra pestaña, navega a otro sitio)
    const handleBeforeUnload = () => {
      limpiarSesion();
    }

    // Detectar cuando presionan el botón de atrás
    const handlePopState = () => {
      // Si van al login, limpiar sesión
      if (window.location.pathname === '/login') {
        limpiarSesion();
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [])
  
  const [formData, setFormData] = useState({
    nombre: "", apellidoPaterno: "", apellidoMaterno: "", genero: "", email: "", telefono: "",
    calleNumero: "", municipio: "", estado: "", colonia: "", codigoPostal: "", estadoCivil: "",
    edad: "", estudios: "", curp: "", estadoNacimiento: "", diaNacimiento: "", mesNacimiento: "",
    anoNacimiento: "", numeroTarjeta: "", aceptaInfo: ""
  })

  const handleInputChange = (field, value) => {
    if (field === "numeroTarjeta") {
      const cleanedValue = value.toString().replace(/\D/g, '').slice(0, 5);
      value = cleanedValue;
      if (cleanedValue.length === 5) {
        verificarDisponibilidadTarjeta(cleanedValue.padStart(5, '0'));
      } else {
        setTarjetaDisponible(null);
        setTarjetaValidando(false);
      }
    } else if (!["email", "telefono", "codigoPostal", "diaNacimiento", "mesNacimiento", "anoNacimiento"].includes(field)) {
      value = value.toString().toUpperCase();
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  const handleBlur = (field, value) => {
    if (field === "numeroTarjeta") {
      const paddedValue = value.padStart(5, '0');
      setFormData(prev => ({ ...prev, [field]: paddedValue }));
      if (paddedValue.length === 5) verificarDisponibilidadTarjeta(paddedValue);
    }
  }

  const verificarDisponibilidadTarjeta = async (numeroTarjeta) => {
    if (!numeroTarjeta || numeroTarjeta.length !== 5) return;
    setTarjetaValidando(true);
    setTarjetaDisponible(null);
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
      const response = await fetch(`https://culturallaccess.com/api/usuario/verificar-tarjeta/${numeroTarjeta}`, {
        method: 'GET', headers: { 'Content-Type': 'application/json' }
      });
      if (response.status === 404) setTarjetaDisponible(true);
      else if (!response.ok) setTarjetaDisponible(true);
      else {
        const result = await response.json();
        setTarjetaDisponible(result.success ? result.disponible : false);
      }
    } catch (error) {
      setTarjetaDisponible(true);
    } finally {
      setTarjetaValidando(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const camposObligatorios = ['nombre', 'apellidoPaterno', 'apellidoMaterno', 'genero', 'email', 'telefono', 'calleNumero', 'municipio', 'estado', 'colonia', 'codigoPostal', 'estadoNacimiento', 'diaNacimiento', 'mesNacimiento', 'anoNacimiento', 'numeroTarjeta', 'aceptaInfo'];
    
    if (camposObligatorios.some(campo => !formData[campo])) {
      alert('POR FAVOR, COMPLETA TODOS LOS CAMPOS OBLIGATORIOS MARCADOS CON *')
      return;
    }

    if (tarjetaDisponible === false) {
      alert('EL NÚMERO DE TARJETA INGRESADO YA ESTÁ REGISTRADO. POR FAVOR, ELIGE OTRO NÚMERO.')
      return;
    }

    if (tarjetaDisponible === null && formData.numeroTarjeta.length === 5) {
      await verificarDisponibilidadTarjeta(formData.numeroTarjeta);
      if (tarjetaDisponible === false) {
        alert('EL NÚMERO DE TARJETA INGRESADO YA ESTÁ REGISTRADO. POR FAVOR, ELIGE OTRO NÚMERO.')
        return;
      }
    }

    setIsSubmitting(true)
    try {
      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        alert('POR FAVOR, INGRESA UN EMAIL VÁLIDO')
        setIsSubmitting(false)
        return
      }

      // Validar formato de fecha
      if (!formData.diaNacimiento || !formData.mesNacimiento || !formData.anoNacimiento) {
        alert('POR FAVOR, COMPLETA LA FECHA DE NACIMIENTO')
        setIsSubmitting(false)
        return
      }

      const toUppercaseStrings = (obj) => Object.fromEntries(Object.entries(obj).map(([key, val]) => {
        // No convertir email, teléfono ni registrado_por a mayúsculas
        if (key === 'email' || key === 'telefono' || key === 'registrado_por') return [key, val]
        return [key, typeof val === 'string' && val.trim() !== '' ? val.toUpperCase() : val]
      }));
      
      const estudiosValue = formData.estudios === "SIN-ESTUDIOS" ? null : formData.estudios;
      const aceptaInfoValue = formData.aceptaInfo === "SI" ? 1 : 0;
      const diaFormateado = formData.diaNacimiento ? formData.diaNacimiento.padStart(2, '0') : '';
      const mesFormateado = formData.mesNacimiento ? formData.mesNacimiento.padStart(2, '0') : '';

      // Validar que la fecha esté completa
      if (!diaFormateado || !mesFormateado || !formData.anoNacimiento) {
        alert('POR FAVOR, COMPLETA CORRECTAMENTE LA FECHA DE NACIMIENTO')
        setIsSubmitting(false)
        return
      }

      const fechaNacimiento = `${formData.anoNacimiento}-${mesFormateado}-${diaFormateado}`;
      
      // Validar formato de fecha (YYYY-MM-DD)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaNacimiento)) {
        alert('LA FECHA DE NACIMIENTO TIENE UN FORMATO INVÁLIDO')
        setIsSubmitting(false)
        return
      }

      const dataToSend = {
        nombre: formData.nombre.trim(), 
        apellido_paterno: formData.apellidoPaterno.trim(), 
        apellido_materno: formData.apellidoMaterno.trim(),
        genero: formData.genero, 
        email: formData.email.trim().toLowerCase(), // Email en minúsculas
        telefono: formData.telefono && formData.telefono.trim() !== '' ? formData.telefono.replace(/\D/g, '') : null, // Remover guiones y caracteres no numéricos
        calle_numero: formData.calleNumero.trim(), 
        municipio: formData.municipio.trim(), 
        estado: formData.estado.trim(),
        colonia: formData.colonia.trim(), 
        codigo_postal: formData.codigoPostal.trim(), 
        edad: formData.edad && formData.edad.trim() !== '' ? formData.edad : null,
        estado_civil: formData.estadoCivil && formData.estadoCivil.trim() !== '' ? formData.estadoCivil : null, 
        estudios: estudiosValue,
        curp: curpOption === "curp" && formData.curp && formData.curp.trim() !== '' ? formData.curp.trim() : null, 
        estado_nacimiento: formData.estadoNacimiento.trim(), 
        fecha_nacimiento: fechaNacimiento,
        numero_tarjeta: formData.numeroTarjeta.padStart(5, '0'), 
        acepta_info: aceptaInfoValue,
        registrado_por: localStorage.getItem('perfilId') || null, // Guardar qué perfil registró este usuario (obtener en el momento del submit)
      }

      const dataFinal = toUppercaseStrings(dataToSend);

      const response = await fetch("https://culturallaccess.com/api/usuario", {
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(dataFinal)
      })

      let responseData;
      let isEmailDuplicate = false;
      
      // Clonar la respuesta antes de leerla para poder leerla múltiples veces si es necesario
      const responseClone = response.clone();
      
      // Intentar leer la respuesta como JSON
      try {
        responseData = await response.json();
      } catch (e) {
        // Si no es JSON, intentar leer como texto
        try {
          const errorText = await responseClone.text();
          responseData = errorText ? { message: errorText } : null;
        } catch (e2) {
          responseData = null;
        }
      }

      if (!response.ok) {
        let errorMessage = `ERROR DEL SERVIDOR: ${response.status}`;
        
        if (responseData) {
          errorMessage = responseData.message || responseData.error || errorMessage;
          
          // Detectar si el error es por email duplicado
          const errorMessageLower = errorMessage.toLowerCase();
          const errorDataStr = JSON.stringify(responseData).toLowerCase();
          isEmailDuplicate = errorMessageLower.includes('email') && 
                            (errorMessageLower.includes('ya existe') || 
                             errorMessageLower.includes('ya está registrado') ||
                             errorMessageLower.includes('duplicado') || 
                             errorMessageLower.includes('already') ||
                             errorMessageLower.includes('existe') ||
                             errorMessageLower.includes('registrado') ||
                             errorDataStr.includes('email') && (errorDataStr.includes('unique') || errorDataStr.includes('duplicate')));
          
          // Si hay errores de validación, mostrarlos
          if (responseData.errors && Array.isArray(responseData.errors)) {
            const errorMessages = responseData.errors.map(err => {
              const field = err.field || err.param || 'Campo';
              const msg = err.message || err.msg || 'Error';
              // Detectar si es error de email duplicado
              if ((field.toLowerCase().includes('email') || msg.toLowerCase().includes('email')) && 
                  (msg.toLowerCase().includes('ya existe') || 
                   msg.toLowerCase().includes('ya está registrado') ||
                   msg.toLowerCase().includes('duplicado') || 
                   msg.toLowerCase().includes('already') ||
                   msg.toLowerCase().includes('registrado'))) {
                isEmailDuplicate = true;
              }
              return `• ${field}: ${msg}`;
            }).join('\n');
            errorMessage = `ERRORES DE VALIDACIÓN:\n${errorMessages}`;
          }
        }
        
        // Si es error de email duplicado, tratar como registro exitoso
        if (isEmailDuplicate && response.status === 400) {
          // Permitir el registro aunque el email ya exista - tratar como exitoso
          alert("¡FORMULARIO ENVIADO CORRECTAMENTE! GRACIAS POR REGISTRARTE.")
          setFormData({ nombre: "", apellidoPaterno: "", apellidoMaterno: "", genero: "", email: "", telefono: "", calleNumero: "", municipio: "", estado: "", colonia: "", codigoPostal: "", edad: "", estudios: "", curp: "", estadoNacimiento: "", diaNacimiento: "", mesNacimiento: "", anoNacimiento: "", numeroTarjeta: "", aceptaInfo: "" })
          setCurpOption("curp")
          setTarjetaDisponible(null)
          setIsSubmitting(false)
          return;
        } else {
          alert(errorMessage); 
          setIsSubmitting(false)
          return;
        }
      }

      // Si la respuesta fue exitosa
      if (responseData && responseData.success) {
        alert("¡FORMULARIO ENVIADO CORRECTAMENTE! GRACIAS POR REGISTRARTE.")
        setFormData({ nombre: "", apellidoPaterno: "", apellidoMaterno: "", genero: "", email: "", telefono: "", calleNumero: "", municipio: "", estado: "", colonia: "", codigoPostal: "", edad: "", estudios: "", curp: "", estadoNacimiento: "", diaNacimiento: "", mesNacimiento: "", anoNacimiento: "", numeroTarjeta: "", aceptaInfo: "" })
        setCurpOption("curp")
        setTarjetaDisponible(null)
      } else if (responseData) {
        if (responseData.errors) {
          const errorMessages = responseData.errors.map(err => `• ${err.field}: ${err.message}`).join('\n');
          alert(`ERRORES DE VALIDACIÓN:\n${errorMessages}`);
        } else {
          alert(`ERROR: ${responseData.message || 'ERROR DESCONOCIDO'}`);
        }
      }
    } catch (error) {
      alert("ERROR DE CONEXIÓN. POR FAVOR, INTENTA DE NUEVO.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const estadosMexico = [
    { value: "aguascalientes", label: "Aguascalientes" }, { value: "baja-california", label: "Baja California" },
    { value: "baja-california-sur", label: "Baja California Sur" }, { value: "campeche", label: "Campeche" },
    { value: "chiapas", label: "Chiapas" }, { value: "chihuahua", label: "Chihuahua" },
    { value: "cdmx", label: "Ciudad de México" }, { value: "coahuila", label: "Coahuila" },
    { value: "colima", label: "Colima" }, { value: "durango", label: "Durango" },
    { value: "guanajuato", label: "Guanajuato" }, { value: "guerrero", label: "Guerrero" },
    { value: "hidalgo", label: "Hidalgo" }, { value: "jalisco", label: "Jalisco" },
    { value: "mexico", label: "México" }, { value: "michoacan", label: "Michoacán" },
    { value: "morelos", label: "Morelos" }, { value: "nayarit", label: "Nayarit" },
    { value: "nuevo-leon", label: "Nuevo León" }, { value: "oaxaca", label: "Oaxaca" },
    { value: "puebla", label: "Puebla" }, { value: "queretaro", label: "Querétaro" },
    { value: "quintana-roo", label: "Quintana Roo" }, { value: "san-luis-potosi", label: "San Luis Potosí" },
    { value: "sinaloa", label: "Sinaloa" }, { value: "sonora", label: "Sonora" },
    { value: "tabasco", label: "Tabasco" }, { value: "tamaulipas", label: "Tamaulipas" },
    { value: "tlaxcala", label: "Tlaxcala" }, { value: "veracruz", label: "Veracruz" },
    { value: "yucatan", label: "Yucatán" }, { value: "zacatecas", label: "Zacatecas" }
  ];

  const municipiosNuevoLeon = [
    { value: "abasolo", label: "Abasolo" }, { value: "agualeguas", label: "Agualeguas" },
    { value: "allende", label: "Allende" }, { value: "anahuac", label: "Anáhuac" },
    { value: "apodaca", label: "Apodaca" }, { value: "aramberri", label: "Aramberri" },
    { value: "bustamante", label: "Bustamante" }, { value: "cadereyta-jimenez", label: "Cadereyta Jiménez" },
    { value: "cerralvo", label: "Cerralvo" }, { value: "cienega-de-flores", label: "Ciénega de Flores" },
    { value: "china", label: "China" }, { value: "doctor-arroyo", label: "Doctor Arroyo" },
    { value: "doctor-coss", label: "Doctor Coss" }, { value: "doctor-gonzalez", label: "Doctor González" },
    { value: "el-carmen", label: "El Carmen" }, { value: "galeana", label: "Galeana" },
    { value: "garcia", label: "García" }, { value: "general-bravo", label: "General Bravo" },
    { value: "general-escobedo", label: "General Escobedo" }, { value: "general-teran", label: "General Terán" },
    { value: "general-trevino", label: "General Treviño" }, { value: "general-zaragoza", label: "General Zaragoza" },
    { value: "general-zuazua", label: "General Zuazua" }, { value: "guadalupe", label: "Guadalupe" },
    { value: "hidalgo", label: "Hidalgo" }, { value: "higueras", label: "Higueras" },
    { value: "hualahuises", label: "Hualahuises" }, { value: "iturbide", label: "Iturbide" },
    { value: "juarez", label: "Juárez" }, { value: "lampazos-de-naranjo", label: "Lampazos de Naranjo" },
    { value: "linares", label: "Linares" }, { value: "los-aldamas", label: "Los Aldamas" },
    { value: "los-herreras", label: "Los Herreras" }, { value: "los-ramones", label: "Los Ramones" },
    { value: "marin", label: "Marín" }, { value: "melchor-ocampo", label: "Melchor Ocampo" },
    { value: "mier-y-noriega", label: "Mier y Noriega" }, { value: "mina", label: "Mina" },
    { value: "montemorelos", label: "Montemorelos" }, { value: "monterrey", label: "Monterrey" },
    { value: "paras", label: "Parás" }, { value: "pesqueria", label: "Pesquería" },
    { value: "rayones", label: "Rayones" }, { value: "sabinas-hidalgo", label: "Sabinas Hidalgo" },
    { value: "salinas-victoria", label: "Salinas Victoria" }, { value: "san-nicolas-de-los-garza", label: "San Nicolás de los Garza" },
    { value: "san-pedro-garza-garcia", label: "San Pedro Garza García" }, { value: "santa-catarina", label: "Santa Catarina" },
    { value: "santiago", label: "Santiago" }, { value: "vallecillo", label: "Vallecillo" },
    { value: "villaldama", label: "Villaldama" }
  ];

  return (
    <div className="relative overflow-hidden h-full">
      <div className="absolute inset-0">
        <img src="/images/BACKGROUND-06.png" alt="Fondo Cultural Access" className="w-full h-full object-cover" />
      </div>
      <div className="relative z-10 h-full flex flex-col">
        <div className="flex flex-row items-center justify-center py-6 space-x-8">
          <div className="flex items-center">
            <img src={imagenes.logoIzquierdo} alt="Logo CULTURA NL" className="w-24 h-24 object-contain" />
          </div>
          <h1 className="uppercase text-[clamp(0.8rem,4.2vw,4.2rem)] leading-tight font-bold text-center px-5" style={{ fontFamily: "'Neue Haas Grotesk Display', sans-serif", fontWeight: 700 }}>
          <span className="text-white">CULTUR</span>
          <span className="text-black ml-1">ALL ACCESS</span>
        </h1>
          <div className="flex items-center">
            <img src={imagenes.logoDerecho} alt="Logo NL" className="w-16 h-16 object-contain" />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="bg-orange-500 rounded-2xl p-8 shadow-2xl max-w-[1090px] w-full max-h-full overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="nombre" className="block text-base font-bold text-gray-800 md:text-white mb-2">NOMBRE (S)*</label>
                  <TextInput id="nombre" name="nombre" autoComplete="given-name" value={formData.nombre}
                    onChange={(e) => handleInputChange("nombre", e.target.value)} placeholder="INGRESA NOMBRE" required disabled={isSubmitting} />
                </div>
                <div>
                  <label htmlFor="apellidoPaterno" className="block text-base font-bold text-white mb-2">APELLIDO PATERNO*</label>
                  <TextInput id="apellidoPaterno" name="apellidoPaterno" autoComplete="family-name" value={formData.apellidoPaterno}
                    onChange={(e) => handleInputChange("apellidoPaterno", e.target.value)} placeholder="INGRESA APELLIDO PATERNO" required disabled={isSubmitting} />
                </div>
                <div>
                  <label htmlFor="apellidoMaterno" className="block text-base font-bold text-white mb-2">APELLIDO MATERNO*</label>
                  <TextInput id="apellidoMaterno" name="apellidoMaterno" autoComplete="additional-name" value={formData.apellidoMaterno}
                    onChange={(e) => handleInputChange("apellidoMaterno", e.target.value)} placeholder="INGRESA APELLIDO MATERNO" required disabled={isSubmitting} />
                </div>
              </div>

              <div>
                <label className="block text-base font-bold text-white mb-2">GÉNERO*</label>
                <div className="space-y-2">
                  {[{ value: "FEMENINO", label: "Femenino" }, { value: "MASCULINO", label: "Masculino" }, { value: "OTRO", label: "Otro" }, { value: "PREFIERO-NO-DECIR", label: "Prefiero no decir" }].map((option) => (
                    <RadioButton key={option.value} id={option.value} name="genero" value={option.value}
                      checked={formData.genero === option.value} onChange={(e) => handleInputChange("genero", e.target.value)}
                      label={option.label} disabled={isSubmitting} required />
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-base font-bold text-white mb-2">EMAIL*</label>
                <TextInput id="email" name="email" type="email" autoComplete="email" value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)} placeholder="INGRESA EMAIL" required disabled={isSubmitting} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="calleNumero" className="block text-base font-bold text-white mb-2">CALLE Y NÚMERO*</label>
                  <TextInput id="calleNumero" name="calleNumero" autoComplete="street-address" value={formData.calleNumero}
                    onChange={(e) => handleInputChange("calleNumero", e.target.value)} placeholder="INGRESA CALLE Y NÚMERO" required disabled={isSubmitting} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="colonia" className="block text-base font-bold text-white mb-2">COLONIA*</label>
                    <TextInput id="colonia" name="colonia" autoComplete="address-level2" value={formData.colonia}
                      onChange={(e) => handleInputChange("colonia", e.target.value)} placeholder="INGRESA COLONIA" required disabled={isSubmitting} />
                  </div>
                  <div>
                    <label htmlFor="codigoPostal" className="block text-base font-bold text-white mb-2">CÓDIGO POSTAL*</label>
                    <TextInput id="codigoPostal" name="codigoPostal" autoComplete="postal-code" value={formData.codigoPostal}
                      onChange={(e) => handleInputChange("codigoPostal", e.target.value)} placeholder="00000" maxLength="5" pattern="[0-9]{5}" required disabled={isSubmitting} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="municipio" className="block text-base font-bold text-white mb-2">MUNICIPIO*</label>
                  <SelectInput id="municipio" name="municipio" autoComplete="address-level2" value={formData.municipio}
                    onChange={(e) => handleInputChange("municipio", e.target.value)} required disabled={isSubmitting}>
                    <option value="" className="text-white">SELECCIONA MUNICIPIO</option>
                    {municipiosNuevoLeon.map((mun) => (
                      <option key={mun.value} value={mun.value.toUpperCase()} className="text-white">{mun.label}</option>
                    ))}
                  </SelectInput>
                </div>
                <div>
                  <label htmlFor="estado" className="block text-base font-bold text-white mb-2">ESTADO*</label>
                  <SelectInput id="estado" name="estado" autoComplete="address-level1" value={formData.estado}
                    onChange={(e) => handleInputChange("estado", e.target.value)} required disabled={isSubmitting}>
                    <option value="" className="text-white">SELECCIONA ESTADO</option>
                    {estadosMexico.map((estado) => (
                      <option key={estado.value} value={estado.value.toUpperCase()} className="text-white">{estado.label}</option>
                    ))}
                  </SelectInput>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="telefono" className="block text-base font-bold text-white mb-2">TELÉFONO*</label>
                <TextInput id="telefono" name="telefono" type="tel" autoComplete="tel" value={formData.telefono}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length > 6) { value = value.slice(0, 10).replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3'); }
                    else if (value.length > 3) { value = value.slice(0, 6).replace(/(\d{3})(\d{3})/, '$1-$2'); }
                    handleInputChange("telefono", value);
                  }} placeholder="123-456-7890" maxLength="12" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" required disabled={isSubmitting} />
              </div>

              <div>
                <label className="block text-base font-bold text-white mb-2">EDAD*</label>
                <div className="space-y-2">
                  {["16-17", "18-29", "30-49", "50-59", "60+"].map((edad) => (
                    <RadioButton key={edad} id={edad} name="edad" value={edad} checked={formData.edad === edad}
                      onChange={(e) => handleInputChange("edad", e.target.value)} label={edad} disabled={isSubmitting} />
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="estudios" className="block text-base font-bold text-white mb-2">ESTUDIOS*</label>
                <SelectInput id="estudios" name="estudios" value={formData.estudios} onChange={(e) => handleInputChange("estudios", e.target.value)} disabled={isSubmitting}>
                  <option value="" className="text-white">ELIGE UNO</option>
                  <option value="PRIMARIA" className="text-white">Primaria</option>
                  <option value="SECUNDARIA" className="text-white">Secundaria</option>
                  <option value="PREPARATORIA" className="text-white">Preparatoria</option>
                  <option value="LICENCIATURA" className="text-white">Licenciatura</option>
                  <option value="MAESTRIA" className="text-white">Maestría</option>
                  <option value="DOCTORADO" className="text-white">Doctorado</option>
                  <option value="SIN-ESTUDIOS" className="text-white">N/A</option>
                </SelectInput>
              </div>
              <div>
                <label htmlFor="estadoCivil" className="block text-base font-bold text-white mb-2">ESTADO CIVIL*</label>
                <SelectInput id="estadoCivil" name="estadoCivil" value={formData.estadoCivil} onChange={e => handleInputChange("estadoCivil", e.target.value)} disabled={isSubmitting}>
                  <option value="" className="text-white">SELECCIONA UNA OPCIÓN</option>
                  <option value="SOLTERO" className="text-white">Soltero (a)</option>
                  <option value="CASADO" className="text-white">Casado (a)</option>
                  <option value="VIUDO" className="text-white">Viudo (a)</option>
                  <option value="DIVORCIADO" className="text-white">Divorciado (a)</option>
                  <option value="UNION_LIBRE" className="text-white">Unión libre</option>
                  <option value="SOCIEDAD_CONVIVENCIA" className="text-white">Sociedad de convivencia</option>
                  <option value="PREFIERO_NO_DECIR" className="text-white">Prefiero no decir</option>
                </SelectInput>
              </div>

              <div>
                <label className="block text-base font-bold text-white mb-2">Selecciona una opción</label>
                <div className="space-y-2">
                  <RadioButton id="curp-option" name="curpOption" value="curp" checked={curpOption === "curp"}
                    onChange={(e) => setCurpOption(e.target.value)} label="CURP" disabled={isSubmitting} />
                  <RadioButton id="sin-curp-option" name="curpOption" value="sin-curp" checked={curpOption === "sin-curp"}
                    onChange={(e) => setCurpOption(e.target.value)} label="Sin CURP" disabled={isSubmitting} />
                </div>
              </div>
              {curpOption === "curp" && (
                <div className="opacity-0 animate-fade-in" style={{ animation: "fadeIn 0.3s ease-in-out forwards" }}>
                  <label htmlFor="curp" className="block text-base font-bold text-white mb-2">INGRESA TU CURP</label>
                  <TextInput id="curp" name="curp" value={formData.curp} onChange={(e) => handleInputChange("curp", e.target.value.toUpperCase())}
                    placeholder="INGRESA CURP (18 CARACTERES)" maxLength={18} pattern="[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z][0-9]" disabled={isSubmitting} />
                  <p className="text-xs text-orange-100 mt-1">Formato: AAAA######HAAAAA##</p>
                </div>
              )}

              <div>
                <label htmlFor="estadoNacimiento" className="block text-base font-bold text-white mb-2">ESTADO DE NACIMIENTO*</label>
                <SelectInput id="estadoNacimiento" name="estadoNacimiento" value={formData.estadoNacimiento}
                  onChange={(e) => handleInputChange("estadoNacimiento", e.target.value)} required disabled={isSubmitting}>
                  <option value="" className="text-white">SELECCIONA ESTADO</option>
                  {estadosMexico.map((estado) => (
                    <option key={estado.value} value={estado.value.toUpperCase()} className="text-white">{estado.label}</option>
                  ))}
                </SelectInput>
              </div>

              <div>
                <label className="block text-base font-bold text-white mb-2">FECHA DE NACIMIENTO*</label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="dia" className="block text-sm text-white mb-1">Día</label>
                    <TextInput id="dia" name="dia" type="number" autoComplete="bday-day" min="1" max="31" value={formData.diaNacimiento}
                      onChange={(e) => handleInputChange("diaNacimiento", e.target.value)} placeholder="DD" required disabled={isSubmitting} />
                  </div>
                  <div>
                    <label htmlFor="mes" className="block text-sm text-white mb-1">Mes</label>
                    <SelectInput id="mes" name="mes" autoComplete="bday-month" value={formData.mesNacimiento}
                      onChange={(e) => handleInputChange("mesNacimiento", e.target.value)} required disabled={isSubmitting}>
                      <option value="" className="text-white">MES</option>
                      <option value="01" className="text-white">Enero</option>
                      <option value="02" className="text-white">Febrero</option>
                      <option value="03" className="text-white">Marzo</option>
                      <option value="04" className="text-white">Abril</option>
                      <option value="05" className="text-white">Mayo</option>
                      <option value="06" className="text-white">Junio</option>
                      <option value="07" className="text-white">Julio</option>
                      <option value="08" className="text-white">Agosto</option>
                      <option value="09" className="text-white">Septiembre</option>
                      <option value="10" className="text-white">Octubre</option>
                      <option value="11" className="text-white">Noviembre</option>
                      <option value="12" className="text-white">Diciembre</option>
                    </SelectInput>
                  </div>
                  <div>
                    <label htmlFor="ano" className="block text-sm text-white mb-1">Año</label>
                    <TextInput id="ano" name="ano" type="number" autoComplete="bday-year" min="1900" max="2024" value={formData.anoNacimiento}
                      onChange={(e) => { const value = e.target.value.slice(0, 4); handleInputChange("anoNacimiento", value); }}
                      placeholder="AAAA" required disabled={isSubmitting} />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="numeroTarjeta" className="block text-base font-bold text-white mb-2">NÚMERO DE TARJETA EN 5 DÍGITOS*</label>
                <div className="relative">
                  <TextInput id="numeroTarjeta" name="numeroTarjeta" value={formData.numeroTarjeta}
                    onChange={(e) => handleInputChange("numeroTarjeta", e.target.value)} onBlur={(e) => handleBlur("numeroTarjeta", e.target.value)}
                    placeholder="Ej. 00015" required disabled={isSubmitting}
                    className={`${tarjetaDisponible === true ? 'border-green-500 focus:ring-green-600' : tarjetaDisponible === false ? 'border-red-500 focus:ring-red-600' : 'border-orange-400 focus:ring-orange-600'}`} />
                  {tarjetaValidando && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600"></div>
                    </div>
                  )}
                  {!tarjetaValidando && tarjetaDisponible === true && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  {!tarjetaValidando && tarjetaDisponible === false && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  )}
                </div>
                {tarjetaValidando && <p className="text-orange-300 text-sm mt-1">🔄 Verificando disponibilidad...</p>}
                {!tarjetaValidando && tarjetaDisponible === true && <p className="text-green-600 text-sm mt-1">✅ Número de tarjeta disponible</p>}
                {!tarjetaValidando && tarjetaDisponible === false && <p className="text-red-600 text-sm mt-1">❌ Este número de tarjeta ya está registrado</p>}
                {!tarjetaValidando && tarjetaDisponible === null && formData.numeroTarjeta.length === 5 && <p className="text-gray-400 text-sm mt-1">⚠️ No se pudo verificar la disponibilidad</p>}
              </div>

              <div>
                <label className="block text-base font-bold text-white mb-2">¿Aceptas recibir información por correo electrónico?*</label>
                <div className="space-y-2">
                  <RadioButton id="aceptaInfo-si" name="aceptaInfo" value="SI" checked={formData.aceptaInfo === "SI"}
                    onChange={() => handleInputChange("aceptaInfo", "SI")} label="Sí acepto" disabled={isSubmitting} required />
                  <RadioButton id="aceptaInfo-no" name="aceptaInfo" value="NO" checked={formData.aceptaInfo === "NO"}
                    onChange={() => handleInputChange("aceptaInfo", "NO")} label="No acepto" disabled={isSubmitting} required />
                </div>
              </div>
              <p className="text-sm text-orange-100 italic">*CAMPO OBLIGATORIO</p>
              <div className="pt-2">
                <button type="submit" disabled={isSubmitting}
                  className="w-full bg-orange-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-orange-500 focus:ring-4 focus:ring-orange-200 transition duration-200 transform hover:scale-105 shadow-lg text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      ENVIANDO...
                    </>
                  ) : (
                    "ENVIAR"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <style jsx="true">{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default CulturalAccessForm