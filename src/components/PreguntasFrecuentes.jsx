import React from 'react';
import { imagenes } from '../constants/imagenes';

const PreguntasFrecuentes = () => {
  return (
    <div className="relative overflow-hidden h-full">
      {/* Fondo naranja sólido */}
      <div className="absolute inset-0 bg-orange-500">
       
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Header con logos */}
        <div className="w-full max-w-[1080px] mx-auto px-4">
          <div className="flex flex-row items-center justify-center py-6 space-x-8">
            {/* Logo izquierdo */}
            <div className="flex items-center">
              <img 
                src={imagenes.logoIzquierdo} 
                alt="Logo CULTURA NL" 
                className="w-36 h-36 object-contain"
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
                className="w-20 h-20 object-contain"
              />
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <main className="flex-1 flex items-center justify-center py-8">
          <div className="w-full max-w-[1080px] mx-auto px-4">
            <div className="">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-black mb-4">
                  PREGUNTAS FRECUENTES
                </h1>
                <h2 className="text-3xl font-bold text-black">
                  "CULTURALL ACCESS"
                </h2>
              </div>

              <div className="text-black text-justify space-y-6">
                {/* Pregunta 1 */}
                <div className="">
                  <h3 className="text-2xl font-bold text-black mb-4">
                    1. ¿Qué es CulturAll Access?
                  </h3>
                  <p className="text-lg leading-relaxed">
                    Es un proyecto de la Secretaría de Cultura de Nuevo León que ofrece beneficios y promociones exclusivas para quienes participan en la vida cultural del estado.
                  </p>
                </div>

                {/* Pregunta 2 */}
                <div className="">
                  <h3 className="text-2xl font-bold text-black mb-4">
                    2. ¿Quién puede registrarse?
                  </h3>
                  <p className="text-lg leading-relaxed">
                    Cualquier persona mayor de 16 años interesada en la cultura: jóvenes, adultos, estudiantes, artistas o público en general.
                  </p>
                </div>

                {/* Pregunta 3 */}
                <div className="">
                  <h3 className="text-2xl font-bold text-black mb-4">
                    3. ¿Tiene algún costo el registro?
                  </h3>
                  <p className="text-lg leading-relaxed">
                    No. El registro en CulturAll Access es completamente gratuito.
                  </p>
                </div>

                {/* Pregunta 4 */}
                <div className="">
                  <h3 className="text-2xl font-bold text-black mb-4">
                    4. ¿Qué tipo de beneficios puedo recibir?
                  </h3>
                  <p className="text-lg leading-relaxed">
                    Promociones como descuentos, accesos preferenciales o gratuitos a eventos culturales, talleres, exposiciones, conciertos, funciones de teatro, cine y más.
                  </p>
                </div>

                {/* Pregunta 5 */}
                <div className="">
                  <h3 className="text-2xl font-bold text-black mb-4">
                    5. ¿Cómo me registro?
                  </h3>
                  <p className="text-lg leading-relaxed">
                    El registro se realiza de forma presencial en los módulos de registro e información que estarán disponibles en distintos eventos culturales. Solo tienes que acercarte y proporcionar tus datos para unirte al programa.
                  </p>
                </div>

                {/* Pregunta 6 */}
                <div className="">
                  <h3 className="text-2xl font-bold text-black mb-4">
                    6. ¿Tengo que asistir a muchos eventos para obtener beneficios?
                  </h3>
                  <p className="text-lg leading-relaxed">
                    No, basta con estar inscrito y mostrar interés en la oferta cultural.
                  </p>
                </div>

                {/* Pregunta 7 */}
                <div className="">
                  <h3 className="text-2xl font-bold text-black mb-4">
                    7. ¿Dónde puedo consultar los eventos disponibles?
                  </h3>
                  <p className="text-lg leading-relaxed">
                    En la página oficial de CulturAll Access: <a href="https://www.culturallaccess.com" className="text-black underline hover:text-black">www.culturallaccess.com</a>.
                  </p>
                </div>

                {/* Pregunta 8 */}
                <div className="">
                  <h3 className="text-2xl font-bold text-black mb-4">
                    8. ¿Los beneficios son personales o puedo compartirlos?
                  </h3>
                  <p className="text-lg leading-relaxed">
                    Son personales. Algunos eventos o promociones pueden permitir acceso con acompañantes. Esto dependerá de las restricciones de cada promoción.
                  </p>
                </div>

                {/* Pregunta 9 */}
                <div className="">
                  <h3 className="text-2xl font-bold text-black mb-4">
                    9. ¿Cómo sé si tengo acceso a un beneficio?
                  </h3>
                  <p className="text-lg leading-relaxed">
                    Todos los beneficios vigentes estarán publicados en la página oficial de CulturAll Access: <a href="https://www.culturallaccess.com" className="text-black underline hover:text-black">www.culturallaccess.com</a>. Te recomendamos visitarla con frecuencia para conocer las promociones, eventos y actividades disponibles.
                  </p>
                </div>

                {/* Pregunta 10 */}
                <div className="">
                  <h3 className="text-2xl font-bold text-black mb-4">
                    10. ¿CulturAll Access está disponible en todo el estado o solo en Monterrey?
                  </h3>
                  <p className="text-lg leading-relaxed">
                    CulturAll Access está pensado para cubrir toda la oferta cultural del estado de Nuevo León y pronto se irán sumando más instituciones.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PreguntasFrecuentes;
