"use client"

import React, { useState } from 'react'
import { imagenes } from '../../constants/imagenes'

const CulturalAccessForm = () => {
  const [curpOption, setCurpOption] = useState("curp")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tarjetaValidando, setTarjetaValidando] = useState(false)
  const [tarjetaDisponible, setTarjetaDisponible] = useState(null)
  const [formData, setFormData] = useState({
    nombre: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    genero: "",
    email: "",
    telefono: "",
    calleNumero: "",
    municipio: "",
    estado: "",
    colonia: "",
    codigoPostal: "",
    estadoCivil: "",
    edad: "",
    estudios: "",
    curp: "",
    estadoNacimiento: "",
    diaNacimiento: "",
    mesNacimiento: "",
    anoNacimiento: "",
    numeroTarjeta: "",
    aceptaInfo: "", // "" | "si" | "no"
  })

  const handleInputChange = (field, value) => {
    // Solo formatear el número de tarjeta cuando se pierde el foco
    if (field === "numeroTarjeta") {
      // Permitir escribir libremente (solo números, máximo 4 dígitos)
      const cleanedValue = value.toString().replace(/\D/g, '').slice(0, 5);
      value = cleanedValue;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Nueva función para manejar cuando el campo pierde el foco
  const handleBlur = (field, value) => {
    if (field === "numeroTarjeta") {
      // Aplicar padding solo al perder el foco
      const paddedValue = value.padStart(5, '0');

      setFormData((prev) => ({
        ...prev,
        [field]: paddedValue,
      }));

      // Verificar disponibilidad del número de tarjeta
      if (paddedValue.length === 5) {
        verificarDisponibilidadTarjeta(paddedValue);
      }
    }
  };

  // Función para verificar disponibilidad del número de tarjeta
  const verificarDisponibilidadTarjeta = async (numeroTarjeta) => {
    if (!numeroTarjeta || numeroTarjeta.length !== 5) return;

    setTarjetaValidando(true);
    setTarjetaDisponible(null);

    // Validación habilitada - verificar con el backend
    console.log('🔍 Verificando disponibilidad de tarjeta:', numeroTarjeta);

    try {
      const url = `https://culturallaccess.residente.mx/api/usuario/verificar-tarjeta/${numeroTarjeta}`;
      console.log('🔗 URL:', url);
      
      const response = await fetch(url);
      console.log('📡 Respuesta del servidor:', response.status, response.statusText);
      
      if (response.status === 404) {
        console.log('⚠️ Endpoint no existe - asumiendo tarjeta disponible');
        setTarjetaDisponible(true);
        return;
      }
      
      const result = await response.json();
      console.log('📊 Resultado:', result);

      if (result.success) {
        console.log('✅ Tarjeta disponible:', result.disponible);
        setTarjetaDisponible(result.disponible);
      } else {
        console.log('❌ Tarjeta no disponible:', result.message || 'Sin mensaje');
        setTarjetaDisponible(false);
      }
    } catch (error) {
      console.error('💥 Error verificando tarjeta:', error);
      // Si hay error de red, asumir que la tarjeta está disponible
      console.log('⚠️ Error de red - asumiendo tarjeta disponible');
      setTarjetaDisponible(true);
    } finally {
      setTarjetaValidando(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validar campos obligatorios
    if (!formData.nombre || !formData.apellidoPaterno || !formData.apellidoMaterno || 
        !formData.genero || !formData.email || !formData.calleNumero || 
        !formData.municipio || !formData.estado || !formData.colonia || 
        !formData.codigoPostal || !formData.estadoNacimiento || 
        !formData.diaNacimiento || !formData.mesNacimiento || !formData.anoNacimiento ||
        !formData.numeroTarjeta || !formData.aceptaInfo) {
      alert('Por favor, completa todos los campos obligatorios marcados con *')
      return;
    }

    // Validar que el número de tarjeta esté disponible
    if (tarjetaDisponible === false) {
      alert('El número de tarjeta ingresado ya está registrado. Por favor, elige otro número.')
      return;
    }

    // Si no se ha verificado la disponibilidad, verificar ahora
    if (tarjetaDisponible === null && formData.numeroTarjeta.length === 5) {
      await verificarDisponibilidadTarjeta(formData.numeroTarjeta);
      if (tarjetaDisponible === false) {
        alert('El número de tarjeta ingresado ya está registrado. Por favor, elige otro número.')
        return;
      }
    }

    setIsSubmitting(true)

    try {
      // Mapear los campos del frontend al formato del backend
      const estudiosValue = formData.estudios === "sin-estudios" ? null : formData.estudios;
      const aceptaInfoValue = formData.aceptaInfo === "si" ? 1 : 0;

      // Validar que los campos de fecha no estén vacíos antes de usar padStart
      const diaFormateado = formData.diaNacimiento ? formData.diaNacimiento.padStart(2, '0') : '';
      const mesFormateado = formData.mesNacimiento ? formData.mesNacimiento.padStart(2, '0') : '';

      const dataToSend = {
        nombre: formData.nombre,
        apellido_paterno: formData.apellidoPaterno,
        apellido_materno: formData.apellidoMaterno,
        genero: formData.genero,
        email: formData.email,
        telefono: formData.telefono || null,
        calle_numero: formData.calleNumero,
        municipio: formData.municipio,
        estado: formData.estado,
        colonia: formData.colonia,
        codigo_postal: formData.codigoPostal,
        edad: formData.edad || null,
        estado_civil: formData.estadoCivil || null,
        estudios: estudiosValue,
        curp: curpOption === "curp" ? formData.curp : null,
        estado_nacimiento: formData.estadoNacimiento,
        fecha_nacimiento: `${formData.anoNacimiento}-${mesFormateado}-${diaFormateado}`,
        numero_tarjeta: formData.numeroTarjeta,
        acepta_info: aceptaInfoValue,
      }

        // Debug: Mostrar datos que se van a enviar
        console.log('Datos que se envían al servidor:', dataToSend);


      const response = await fetch("https://culturallaccess.residente.mx/api/usuario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      })

      console.log('Respuesta del servidor:', response.status, response.statusText);

      if (!response.ok) {
        // Manejar errores HTTP (400, 500, etc.)
        let errorMessage = `Error del servidor: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error('Error del servidor:', errorData);
        } catch (e) {
          console.error('No se pudo parsear la respuesta de error:', e);
        }
        alert(errorMessage);
        return;
      }

      const result = await response.json()
      console.log('Resultado del servidor:', result);

      if (result.success) {
        alert("¡Formulario enviado correctamente! Gracias por registrarte.")
        // Limpiar el formulario
        setFormData({
          nombre: "",
          apellidoPaterno: "",
          apellidoMaterno: "",
          genero: "",
          email: "",
          telefono: "",
          calleNumero: "",
          municipio: "",
          estado: "",
          colonia: "",
          codigoPostal: "",
          edad: "",
          estudios: "",
          curp: "",
          estadoNacimiento: "",
          diaNacimiento: "",
          mesNacimiento: "",
          anoNacimiento: "",
          numeroTarjeta: "",
          aceptaInfo: "",
        })
        setCurpOption("curp")
        setTarjetaDisponible(null)
      } else {
        // Manejar diferentes tipos de errores
        if (result.errors) {
          // Mostrar errores de validación específicos
          const errorMessages = result.errors.map(err =>
            `• ${err.field}: ${err.message}`
          ).join('\n');

          alert(`Errores de validación:\n${errorMessages}`);
        } else {
          alert(`Error: ${result.message || 'Error desconocido'}`);
        }
      }
    } catch (error) {
      console.error('Error en el envío:', error);
      alert("Error de conexión. Por favor, intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Icono de chevron down SVG inline
  const ChevronDownIcon = () => (
    <svg
      className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-orange-600 pointer-events-none"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )

  const estadosMexico = [
    { value: "aguascalientes", label: "Aguascalientes" },
    { value: "baja-california", label: "Baja California" },
    { value: "baja-california-sur", label: "Baja California Sur" },
    { value: "campeche", label: "Campeche" },
    { value: "chiapas", label: "Chiapas" },
    { value: "chihuahua", label: "Chihuahua" },
    { value: "cdmx", label: "Ciudad de México" },
    { value: "coahuila", label: "Coahuila" },
    { value: "colima", label: "Colima" },
    { value: "durango", label: "Durango" },
    { value: "guanajuato", label: "Guanajuato" },
    { value: "guerrero", label: "Guerrero" },
    { value: "hidalgo", label: "Hidalgo" },
    { value: "jalisco", label: "Jalisco" },
    { value: "mexico", label: "México" },
    { value: "michoacan", label: "Michoacán" },
    { value: "morelos", label: "Morelos" },
    { value: "nayarit", label: "Nayarit" },
    { value: "nuevo-leon", label: "Nuevo León" },
    { value: "oaxaca", label: "Oaxaca" },
    { value: "puebla", label: "Puebla" },
    { value: "queretaro", label: "Querétaro" },
    { value: "quintana-roo", label: "Quintana Roo" },
    { value: "san-luis-potosi", label: "San Luis Potosí" },
    { value: "sinaloa", label: "Sinaloa" },
    { value: "sonora", label: "Sonora" },
    { value: "tabasco", label: "Tabasco" },
    { value: "tamaulipas", label: "Tamaulipas" },
    { value: "tlaxcala", label: "Tlaxcala" },
    { value: "veracruz", label: "Veracruz" },
    { value: "yucatan", label: "Yucatán" },
    { value: "zacatecas", label: "Zacatecas" }
  ];

  const municipiosNuevoLeon = [
    { value: "abasolo", label: "Abasolo" },
    { value: "agualeguas", label: "Agualeguas" },
    { value: "allende", label: "Allende" },
    { value: "anahuac", label: "Anáhuac" },
    { value: "apodaca", label: "Apodaca" },
    { value: "aramberri", label: "Aramberri" },
    { value: "bustamante", label: "Bustamante" },
    { value: "cadereyta-jimenez", label: "Cadereyta Jiménez" },
    { value: "cerralvo", label: "Cerralvo" },
    { value: "cienega-de-flores", label: "Ciénega de Flores" },
    { value: "china", label: "China" },
    { value: "doctor-arroyo", label: "Doctor Arroyo" },
    { value: "doctor-coss", label: "Doctor Coss" },
    { value: "doctor-gonzalez", label: "Doctor González" },
    { value: "el-carmen", label: "El Carmen" },
    { value: "galeana", label: "Galeana" },
    { value: "garcia", label: "García" },
    { value: "general-bravo", label: "General Bravo" },
    { value: "general-escobedo", label: "General Escobedo" },
    { value: "general-teran", label: "General Terán" },
    { value: "general-trevino", label: "General Treviño" },
    { value: "general-zaragoza", label: "General Zaragoza" },
    { value: "general-zuazua", label: "General Zuazua" },
    { value: "guadalupe", label: "Guadalupe" },
    { value: "hidalgo", label: "Hidalgo" },
    { value: "higueras", label: "Higueras" },
    { value: "hualahuises", label: "Hualahuises" },
    { value: "iturbide", label: "Iturbide" },
    { value: "juarez", label: "Juárez" },
    { value: "lampazos-de-naranjo", label: "Lampazos de Naranjo" },
    { value: "linares", label: "Linares" },
    { value: "los-aldamas", label: "Los Aldamas" },
    { value: "los-herreras", label: "Los Herreras" },
    { value: "los-ramones", label: "Los Ramones" },
    { value: "marin", label: "Marín" },
    { value: "melchor-ocampo", label: "Melchor Ocampo" },
    { value: "mier-y-noriega", label: "Mier y Noriega" },
    { value: "mina", label: "Mina" },
    { value: "montemorelos", label: "Montemorelos" },
    { value: "monterrey", label: "Monterrey" },
    { value: "paras", label: "Parás" },
    { value: "pesqueria", label: "Pesquería" },
    { value: "rayones", label: "Rayones" },
    { value: "sabinas-hidalgo", label: "Sabinas Hidalgo" },
    { value: "salinas-victoria", label: "Salinas Victoria" },
    { value: "san-nicolas-de-los-garza", label: "San Nicolás de los Garza" },
    { value: "san-pedro-garza-garcia", label: "San Pedro Garza García" },
    { value: "santa-catarina", label: "Santa Catarina" },
    { value: "santiago", label: "Santiago" },
    { value: "vallecillo", label: "Vallecillo" },
    { value: "villaldama", label: "Villaldama" }
  ];

  return (
    <div className="relative overflow-hidden h-full">
      {/* Fondo naranja con rayas diagonales */}
      <div className="absolute inset-0">
        <img 
          src="/images/BACKGROUND-06.png" 
          alt="Fondo Cultural Access"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Header con logos */}
        <div className="flex flex-row items-center justify-center py-6 space-x-8">
          {/* Logo izquierdo */}
          <div className="flex items-center">
            <img 
              src={imagenes.logoIzquierdo} 
              alt="Logo CULTURA NL" 
              className="w-24 h-24 object-contain"
            />
          </div>
          
          {/* Título central */}
          <h1 className="uppercase text-7xl font-bold text-center">
            <span className="text-white">CULTUR</span>
            <span className="text-black ml-2">ALL ACCESS</span>
          </h1>
          
          {/* Logo derecho */}
          <div className="flex items-center">
            <img 
              src={imagenes.logoDerecho} 
              alt="Logo NL" 
              className="w-16 h-16 object-contain"
            />
          </div>
        </div>

        {/* Imagen del header del formulario */}
        <div className="flex justify-center mb-6">
          <img 
            src="/ForRegistrio.png" 
            alt="Header Registro Cultural Access"
            className="w-96 h-32 object-contain"
          />
        </div>

        {/* Formulario centrado */}
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="bg-orange-500 rounded-2xl p-8 shadow-2xl max-w-[1090px] w-full max-h-full overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Título del formulario */}
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-white mb-2">REGISTRO CULTURAL ACCESS</h2>
                <p className="text-orange-100 text-base">Completa tus datos para registrarte</p>
              </div>

              {/* Nombres - 3 campos en fila */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="nombre" className="block text-base font-bold text-gray-800 mb-2">
                    NOMBRE (S) *
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange("nombre", e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border-2 border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent transition duration-200 bg-white text-black text-base placeholder:text-gray-500"
                    placeholder="Ingresa tu nombre"
                  />
                </div>
                <div>
                  <label htmlFor="apellidoPaterno" className="block text-base font-bold text-gray-800 mb-2">
                    APELLIDO PATERNO *
                  </label>
                  <input
                    type="text"
                    id="apellidoPaterno"
                    value={formData.apellidoPaterno}
                    onChange={(e) => handleInputChange("apellidoPaterno", e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border-2 border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent transition duration-200 bg-white text-black text-base placeholder:text-gray-500"
                    placeholder="Ingresa tu apellido paterno"
                  />
                </div>
                <div>
                  <label htmlFor="apellidoMaterno" className="block text-base font-bold text-gray-800 mb-2">
                    APELLIDO MATERNO *
                  </label>
                  <input
                    type="text"
                    id="apellidoMaterno"
                    value={formData.apellidoMaterno}
                    onChange={(e) => handleInputChange("apellidoMaterno", e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border-2 border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent transition duration-200 bg-white text-black text-base placeholder:text-gray-500"
                    placeholder="Ingresa tu apellido materno"
                  />
                </div>
              </div>

              {/* Género - Radio buttons verticales */}
              <div>
                <label className="block text-base font-bold text-gray-800 mb-2">GÉNERO *</label>
                <div className="space-y-2">
                  {[
                    { value: "femenino", label: "Femenino" },
                    { value: "masculino", label: "Masculino" },
                    { value: "prefiero-no-decir", label: "Prefiero no decir" },
                  ].map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={option.value}
                        name="genero"
                        value={option.value}
                        checked={formData.genero === option.value}
                        onChange={(e) => handleInputChange("genero", e.target.value)}
                        className="w-4 h-4 text-orange-500 border-orange-400 bg-transparent focus:ring-orange-600 focus:ring-2"
                        disabled={isSubmitting}
                        required
                      />
                      <label htmlFor={option.value} className="text-gray-800 text-sm">
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Email - Campo completo */}
              <div>
                <label htmlFor="email" className="block text-base font-bold text-gray-800 mb-2">
                  EMAIL *
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border-2 border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent transition duration-200 bg-white text-black text-base placeholder:text-gray-500"
                  placeholder="Ingresa tu email"
                />
              </div>

              {/* Dirección - Calle y Colonia en 2 columnas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="calleNumero" className="block text-base font-bold text-gray-800 mb-2">
                    CALLE Y NÚMERO *
                  </label>
                  <input
                    type="text"
                    id="calleNumero"
                    value={formData.calleNumero}
                    onChange={(e) => handleInputChange("calleNumero", e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border-2 border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent transition duration-200 bg-white text-black text-base placeholder:text-gray-500"
                    placeholder="Ingresa calle y número"
                  />
                </div>
                <div>
                  <label htmlFor="colonia" className="block text-base font-bold text-gray-800 mb-2">
                    COLONIA *
                  </label>
                  <input
                    type="text"
                    id="colonia"
                    value={formData.colonia}
                    onChange={(e) => handleInputChange("colonia", e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border-2 border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent transition duration-200 bg-white text-black text-base placeholder:text-gray-500"
                    placeholder="Ingresa tu colonia"
                  />
                </div>
              </div>

              {/* Municipio, Estado y Código Postal - 3 columnas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="municipio" className="block text-base font-bold text-gray-800 mb-2">
                    MUNICIPIO *
                  </label>
                  <div className="relative">
                    <select
                      id="municipio"
                      value={formData.municipio}
                      onChange={(e) => handleInputChange("municipio", e.target.value)}
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 border-2 border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent transition duration-200 bg-white text-base appearance-none text-black"
                    >
                      <option value="" className="text-gray-800">
                        Selecciona municipio
                      </option>
                      {municipiosNuevoLeon.map((mun) => (
                        <option key={mun.value} value={mun.value} className="text-gray-800">
                          {mun.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDownIcon />
                  </div>
                </div>
                <div>
                  <label htmlFor="estado" className="block text-base font-bold text-gray-800 mb-2">
                    ESTADO *
                  </label>
                  <div className="relative">
                    <select
                      id="estado"
                      value={formData.estado}
                      onChange={(e) => handleInputChange("estado", e.target.value)}
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 border-2 border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent transition duration-200 bg-white text-base appearance-none text-black"
                    >
                      <option value="" className="text-gray-800">
                        Selecciona estado
                      </option>
                      {estadosMexico.map((estado) => (
                        <option key={estado.value} value={estado.value} className="text-gray-800">
                          {estado.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDownIcon />
                  </div>
                </div>
                <div>
                  <label htmlFor="codigoPostal" className="block text-base font-bold text-gray-800 mb-2">
                    CÓDIGO POSTAL *
                  </label>
                  <input
                    type="text"
                    id="codigoPostal"
                    value={formData.codigoPostal}
                    onChange={(e) => handleInputChange("codigoPostal", e.target.value)}
                    maxLength="5"
                    pattern="[0-9]{5}"
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border-2 border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent transition duration-200 bg-white text-black text-base placeholder:text-gray-500"
                    placeholder="00000"
                  />
                </div>
              </div>

               {/* Teléfono */}
            <div className="space-y-2">
              <label htmlFor="telefono" className="block text-base font-bold text-gray-800 mb-2">
                TELÉFONO
              </label>
              <input
                id="telefono"
                type="text"
                value={formData.telefono}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, ''); // Solo números
                  
                  // Formatear automáticamente con guiones
                  if (value.length > 6) {
                    value = value.slice(0, 10); // Máximo 10 dígitos
                    value = value.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
                  } else if (value.length > 3) {
                    value = value.slice(0, 6);
                    value = value.replace(/(\d{3})(\d{3})/, '$1-$2');
                  }
                  
                  handleInputChange("telefono", value);
                }}
                className="w-full px-4 py-3 border-2 border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent transition duration-200 bg-white text-black text-base placeholder:text-gray-500"
                maxLength="12"
                pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                disabled={isSubmitting}
                placeholder="123-456-7890"
              />
            </div>

              {/* Edad - Radio buttons verticales */}
              <div>
                <label className="block text-base font-bold text-gray-800 mb-2">EDAD</label>
                <div className="space-y-2">
                  {["16-17", "18-29", "30-49", "50-59", "60+"].map((edad) => (
                    <div key={edad} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={edad}
                        name="edad"
                        value={edad}
                        checked={formData.edad === edad}
                        onChange={(e) => handleInputChange("edad", e.target.value)}
                        className="w-4 h-4 text-orange-500 border-orange-400 bg-transparent focus:ring-orange-600 focus:ring-2"
                        disabled={isSubmitting}
                      />
                      <label htmlFor={edad} className="text-gray-800 text-sm">
                        {edad}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Estudios - Dropdown */}
              <div>
                <label htmlFor="estudios" className="block text-base font-bold text-gray-800 mb-2">
                  ESTUDIOS
                </label>
                <div className="relative">
                  <select
                    id="estudios"
                    value={formData.estudios}
                    onChange={(e) => handleInputChange("estudios", e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border-2 border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent transition duration-200 bg-white text-base appearance-none text-black"
                  >
                    <option value="" className="text-gray-800">
                      Elige uno
                    </option>
                    <option value="primaria" className="text-gray-800">
                      Primaria
                    </option>
                    <option value="secundaria" className="text-gray-800">
                      Secundaria
                    </option>
                    <option value="preparatoria" className="text-gray-800">
                      Preparatoria
                    </option>
                    <option value="licenciatura" className="text-gray-800">
                      Licenciatura
                    </option>
                    <option value="maestria" className="text-gray-800">
                      Maestría
                    </option>
                    <option value="doctorado" className="text-gray-800">
                      Doctorado
                    </option>
                    <option value="sin-estudios" className="text-gray-800">
                      N/A
                    </option>
                  </select>
                  <ChevronDownIcon />
                </div>
              </div>

              {/* Estado civil - Dropdown */}
              <div>
                <label htmlFor="estadoCivil" className="block text-base font-bold text-gray-800 mb-2">
                  ESTADO CIVIL
                </label>
                <div className="relative">
                  <select
                    id="estadoCivil"
                    value={formData.estadoCivil}
                    onChange={e => handleInputChange("estadoCivil", e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border-2 border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent transition duration-200 bg-white text-base appearance-none text-black"
                  >
                    <option value="" className="text-gray-800">
                      Selecciona una opción
                    </option>
                    <option value="soltero" className="text-gray-800">
                      Soltero (a)
                    </option>
                    <option value="casado" className="text-gray-800">
                      Casado (a)
                    </option>
                    <option value="viudo" className="text-gray-800">
                      Viudo (a)
                    </option>
                    <option value="divorciado" className="text-gray-800">
                      Divorciado (a)
                    </option>
                    <option value="union_libre" className="text-gray-800">
                      Unión libre
                    </option>
                    <option value="sociedad_convivencia" className="text-gray-800">
                      Sociedad de convivencia
                    </option>
                    <option value="prefiero_no_decir" className="text-gray-800">
                      Prefiero no decir
                    </option>
                  </select>
                  <ChevronDownIcon />
                </div>
              </div>

              {/* Selección CURP - Radio buttons */}
              <div>
                <label className="block text-base font-bold text-gray-800 mb-2">Selecciona una opción</label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="curp-option"
                      name="curpOption"
                      value="curp"
                      checked={curpOption === "curp"}
                      onChange={(e) => setCurpOption(e.target.value)}
                      className="w-4 h-4 text-orange-500 border-orange-400 bg-transparent focus:ring-orange-600 focus:ring-2"
                      disabled={isSubmitting}
                    />
                    <label htmlFor="curp-option" className="text-gray-800">
                      CURP
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="sin-curp-option"
                      name="curpOption"
                      value="sin-curp"
                      checked={curpOption === "sin-curp"}
                      onChange={(e) => setCurpOption(e.target.value)}
                      className="w-4 h-4 text-orange-500 border-orange-400 bg-transparent focus:ring-orange-600 focus:ring-2"
                      disabled={isSubmitting}
                    />
                    <label htmlFor="sin-curp-option" className="text-gray-800">
                      Sin CURP
                    </label>
                  </div>
                </div>
              </div>

              {/* Campo CURP condicional */}
              {curpOption === "curp" && (
                <div
                  className="opacity-0 animate-fade-in"
                  style={{ animation: "fadeIn 0.3s ease-in-out forwards" }}
                >
                  <label htmlFor="curp" className="block text-base font-bold text-gray-800 mb-2">
                    INGRESA TU CURP
                  </label>
                  <input
                    type="text"
                    id="curp"
                    value={formData.curp}
                    onChange={(e) => handleInputChange("curp", e.target.value.toUpperCase())}
                    placeholder="Ingresa tu CURP (18 caracteres)"
                    maxLength={18}
                    pattern="[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z][0-9]"
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border-2 border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent transition duration-200 bg-white text-black text-base placeholder:text-gray-500"
                  />
                  <p className="text-xs text-orange-100 mt-1">Formato: AAAA######HAAAAA##</p>
                </div>
              )}

              {/* Estado de nacimiento - Dropdown */}
              <div>
                <label htmlFor="estadoNacimiento" className="block text-base font-bold text-gray-800 mb-2">
                  ESTADO DE NACIMIENTO *
                </label>
                <div className="relative">
                  <select
                    id="estadoNacimiento"
                    value={formData.estadoNacimiento}
                    onChange={(e) => handleInputChange("estadoNacimiento", e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border-2 border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent transition duration-200 bg-white text-base appearance-none text-black"
                  >
                    <option value="" className="text-gray-800">
                      Selecciona estado
                    </option>
                    {estadosMexico.map((estado) => (
                      <option key={estado.value} value={estado.value} className="text-gray-800">
                        {estado.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon />
                </div>
              </div>

              {/* Fecha de nacimiento - 3 campos en fila */}
              <div>
                <label className="block text-base font-bold text-gray-800 mb-2">FECHA DE NACIMIENTO *</label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="dia" className="block text-sm text-gray-600 mb-1">
                      Día
                    </label>
                    <input
                      type="number"
                      id="dia"
                      min="1"
                      max="31"
                      value={formData.diaNacimiento}
                      onChange={(e) => handleInputChange("diaNacimiento", e.target.value)}
                      placeholder="DD"
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 border-2 border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent transition duration-200 bg-white text-black text-base placeholder:text-gray-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="mes" className="block text-sm text-gray-600 mb-1">
                      Mes
                    </label>
                    <div className="relative">
                      <select
                        id="mes"
                        value={formData.mesNacimiento}
                        onChange={(e) => handleInputChange("mesNacimiento", e.target.value)}
                        required
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 border-2 border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent transition duration-200 bg-white text-base appearance-none text-black"
                      >
                        <option value="" className="text-gray-800">
                          Mes
                        </option>
                        <option value="01" className="text-gray-800">
                          Enero
                        </option>
                        <option value="02" className="text-gray-800">
                          Febrero
                        </option>
                        <option value="03" className="text-gray-800">
                          Marzo
                        </option>
                        <option value="04" className="text-gray-800">
                          Abril
                        </option>
                        <option value="05" className="text-gray-800">
                          Mayo
                        </option>
                        <option value="06" className="text-gray-800">
                          Junio
                        </option>
                        <option value="07" className="text-gray-800">
                          Julio
                        </option>
                        <option value="08" className="text-gray-800">
                          Agosto
                        </option>
                        <option value="09" className="text-gray-800">
                          Septiembre
                        </option>
                        <option value="10" className="text-gray-800">
                          Octubre
                        </option>
                        <option value="11" className="text-gray-800">
                          Noviembre
                        </option>
                        <option value="12" className="text-gray-800">
                          Diciembre
                        </option>
                      </select>
                      <ChevronDownIcon />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="ano" className="block text-sm text-gray-600 mb-1">
                      Año
                    </label>
                    <input
                      type="number"
                      id="ano"
                      min="1900"
                      max="2024"
                      value={formData.anoNacimiento}
                      onChange={(e) => {
                        const value = e.target.value.slice(0, 4);
                        handleInputChange("anoNacimiento", value);
                      }}
                      placeholder="AAAA"
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 border-2 border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent transition duration-200 bg-white text-black text-base placeholder:text-gray-500"
                    />
                  </div>
                </div>
              </div>

              {/* Número de tarjeta - Campo completo */}
              <div>
                <label htmlFor="numeroTarjeta" className="block text-base font-bold text-gray-800 mb-2">
                  NÚMERO DE TARJETA EN 5 DÍGITOS*
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="numeroTarjeta"
                    value={formData.numeroTarjeta}
                    onChange={(e) => handleInputChange("numeroTarjeta", e.target.value)}
                    onBlur={(e) => handleBlur("numeroTarjeta", e.target.value)}
                    placeholder="Ej. 00015"
                    required
                    disabled={isSubmitting}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:border-transparent transition duration-200 bg-white text-black text-base placeholder:text-gray-500 ${
                      tarjetaDisponible === true 
                        ? 'border-green-500 focus:ring-green-600' 
                        : tarjetaDisponible === false 
                        ? 'border-red-500 focus:ring-red-600' 
                        : 'border-orange-400 focus:ring-orange-600'
                    }`}
                  />
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
                {tarjetaDisponible === true && (
                  <p className="text-green-600 text-sm mt-1">✓ Número de tarjeta disponible</p>
                )}
                {tarjetaDisponible === false && (
                  <p className="text-red-600 text-sm mt-1">✗ Este número de tarjeta ya está registrado</p>
                )}
              </div>

              {/* Acepta información - Radio buttons */}
              <div>
                <label className="block text-base font-bold text-gray-800 mb-2">
                  ¿Aceptas recibir información por correo electrónico? *
                </label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="aceptaInfo-si"
                      name="aceptaInfo"
                      value="si"
                      checked={formData.aceptaInfo === "si"}
                      onChange={() => handleInputChange("aceptaInfo", "si")}
                      className="w-4 h-4 text-orange-500 border-orange-400 bg-transparent focus:ring-orange-600 focus:ring-2"
                      disabled={isSubmitting}
                      required
                    />
                    <label htmlFor="aceptaInfo-si" className="text-gray-800 text-sm">
                      Sí, acepto
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="aceptaInfo-no"
                      name="aceptaInfo"
                      value="no"
                      checked={formData.aceptaInfo === "no"}
                      onChange={() => handleInputChange("aceptaInfo", "no")}
                      className="w-4 h-4 text-orange-500 border-orange-400 bg-transparent focus:ring-orange-600 focus:ring-2"
                      disabled={isSubmitting}
                      required
                    />
                    <label htmlFor="aceptaInfo-no" className="text-gray-800 text-sm">
                      No acepto
                    </label>
                  </div>
                </div>
              </div>

              {/* Texto de campos obligatorios */}
              <p className="text-sm text-orange-100 italic">*Campo obligatorio</p>

              {/* Botón Enviar */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-orange-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-orange-500 focus:ring-4 focus:ring-orange-200 transition duration-200 transform hover:scale-105 shadow-lg text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Enviando..." : "Registrarse"}
                </button>
              </div>
            </form>
          </div>
        </div>

        
      </div>

      <style jsx="true">{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

export default CulturalAccessForm
  