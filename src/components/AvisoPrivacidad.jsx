import React from 'react';
import { imagenes } from '../constants/imagenes';
import useDocumentTitle from '../hooks/useDocumentTitle';

const AvisoPrivacidad = () => {
  useDocumentTitle('Aviso de Privacidad');
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
              className="w-32 h-32 object-contain"
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
        </div>

        {/* Contenido principal */}
        <main className="flex-1 flex items-center justify-center py-8">
          <div className="w-full max-w-[1080px] mx-auto px-4">
            <div className="">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-black mb-4">
                  AVISO DE PRIVACIDAD INTEGRAL DEL PROYECTO
                </h1>
                <h2 className="text-3xl font-bold text-black">
                  "CULTURALL ACCESS"
                </h2>
              </div>

                             <div className="text-black text-justify space-y-6">
                 <p className="text-lg leading-relaxed">
                   De conformidad con lo dispuesto en los artículos 3, fracción II, 26, 27 y 28 de la Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados; artículos 3, fracción II, 27, 28, 29 y 30 de la Ley de Protección de Datos Personales en posesión de Sujetos Obligados del Estado de Nuevo León y demás normatividad que resulte aplicable, se pone a su disposición el Aviso de Privacidad Integral conforme a lo siguiente:
                 </p>

                 <p className="text-lg leading-relaxed">
                   La Secretaría de Cultura, como dependencia del Poder Ejecutivo, integrante del Gabinete de Igualdad para Todas las Personas, de acuerdo con lo establecido en la fracción V, apartado C, del artículo 18 de la Ley Orgánica de la Administración Pública para el Estado de Nuevo León, es la institución encargada de diseñar y ejecutar políticas relativas a garantizar el ejercicio de los derechos culturales de las personas, a través de la gobernanza del sector cultural y su vinculación transversal a las políticas públicas, enfocadas en el desarrollo humano, social y económico de Nuevo León.
                 </p>

                 <p className="text-lg leading-relaxed">
                   La Secretaría de Cultura, es la responsable del tratamiento de los datos personales que se proporcionen con la finalidad de estar en posibilidad de llevar a cabo las gestiones relativas a los trámites y servicios que se brindan en el ámbito de sus respectivas atribuciones, de conformidad con la Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados, la Ley de Protección de Datos Personales en Posesión de Sujetos Obligados del Estado de Nuevo León, la Ley Orgánica de la Administración Pública para el Estado de Nuevo León, el Reglamento Interior de la Secretaría de Cultura y demás normatividad que resulte aplicable.
                 </p>

                 <div className="mt-8">
                   <h3 className="text-2xl font-bold text-black mb-4">
                     Domicilio de la Secretaría de Cultura.
                   </h3>
                   <p className="text-lg leading-relaxed">
                     Las instalaciones de la Secretaría de Cultura se encuentran ubicadas en el Laboratorio Cultural Ciudadano / Antiguo Palacio Federal | 4° Piso, Washington, Oriente, No. 648, entre Zuazua y Zaragoza, Zona Centro, Monterrey, Nuevo León, CP 64000 o por medio electrónico en el correo culturatransparente@nuevoleon.gob.mx.
                   </p>
                 </div>

                 <div className="mt-8">
                   <h3 className="text-2xl font-bold text-black mb-4">
                     Datos Personales que serán sometidos a tratamiento
                   </h3>
                   <p className="text-lg leading-relaxed">
                     La Secretaría de Cultura, en cumplimiento a los principios y deberes que deben observar los sujetos obligados, a fin de cumplir con lo dispuesto en la Ley Protección de Datos Personales en Posesión de Sujetos Obligados del Estado de Nuevo León y la Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados, le informa que los datos personales que nos proporcione son aquellos categorizados como de Identificación, estadístico y contacto, mismos que se describen a continuación: nombre, correo electrónico, domicilio, rango de edad, número de teléfono, nivel de estudios, estado civil, CURP o en su defecto lugar y fecha de nacimiento.
                   </p>
                   <p className="text-lg leading-relaxed mt-4">
                     De igual manera, se le hace de su conocimiento que se solicitaran los siguientes datos personales sensibles: Dato personal identificado como: género.
                   </p>
                   <p className="text-lg leading-relaxed mt-4">
                     En estas condiciones, se hace saber a Usted, que los datos personales proporcionados a este Sujeto Obligado podrán ser utilizados para informes de control y estadísticos, mismos que serán previamente disociados, por lo que no será posible identificar a las personas titulares.
                   </p>
                 </div>

                 <div className="mt-8">
                   <h3 className="text-2xl font-bold text-black mb-4">
                     Finalidad por la cual se obtienen los datos personales.
                   </h3>
                   <p className="text-lg leading-relaxed">
                     Los datos personales recabados por la Secretaría de Cultura serán utilizados para fines de control y estadísticos y para las siguientes finalidades:
                   </p>
                   <ul className="list-disc list-inside text-lg leading-relaxed space-y-2 mt-4 ml-4">
                     <li>Registrar la participación y seguimiento de las personas usuarias dentro del proyecto CulturAll Access, con las empresas culturales;</li>
                     <li>Brindar información y orientación sobre programas, proyectos y trámites del Gobierno del Estado;</li>
                     <li>Recabar información que nos permita realizar estadísticas relacionadas con las actividades cultura de preferencia de las personas usuarias;</li>
                     <li>Realizar registros que arrojen información respecto a las preferencias de las actividades culturales del estado de Nuevo León;</li>
                     <li>Realizar registros que definan la afluencia de personas que se reciben en diferentes actividades culturales y;</li>
                     <li>Promocionar y difundir de actividades culturales.</li>
                   </ul>
                   <p className="text-lg leading-relaxed mt-4">
                     Por otra parte, se informa que cuando se proporcionen datos relativos al origen racial o étnico, estado de salud presente o futuro, información genética, creencias religiosas, filosóficas y morales, opiniones políticas y preferencia sexual, serán resguardados como datos sensibles, en términos de lo dispuesto por los artículos 3 fracción X, 7, 21 y 75 de la Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados.
                   </p>
                 </div>

                 <div className="mt-8">
                   <h3 className="text-2xl font-bold text-black mb-4">
                     Fundamento legal para el tratamiento de datos personales.
                   </h3>
                   <p className="text-lg leading-relaxed">
                     El tratamiento de sus Datos Personales se realiza con el fundamento en lo establecido en los artículos 1 párrafo 5, 3 fracción X, XI, XXXIII, XXXVIII, 16,17,18, 22, 23, 27, 52, 53, 54, 55, 56, 59, 60, 76, 77, 78, 79, 80, 81 y 99 la Ley de Protección de Datos Personales en Posesión de Sujetos Obligados del Estado de Nuevo León y los correlativos de la Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados.
                   </p>
                 </div>

                 <div className="mt-8">
                   <h3 className="text-2xl font-bold text-black mb-4">
                     Manifestación de negativa para el Tratamiento de sus Datos Personales.
                   </h3>
                   <p className="text-lg leading-relaxed">
                     Podrá manifestar la negativa de tratamiento de sus datos personales directamente en las instalaciones de la Unidad de Transparencia de la Secretaría de Cultura ubicada en calle 5 de Mayo, número 525, Edificio Elizondo Páez Primer Piso, colonia Centro, C.P. 64000, en Monterrey, Nuevo León, CP 64000 o por medio electrónico en el correo culturatransparente@nuevoleon.gob.mx.
                   </p>
                 </div>

                 <div className="mt-8">
                   <h3 className="text-2xl font-bold text-black mb-4">
                     Transferencia de datos personales.
                   </h3>
                   <p className="text-lg leading-relaxed">
                     De conformidad con la Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados y la Ley de Protección de Datos Personales en Posesión de Sujetos Obligados del Estado de Nuevo León, se podrán hacer transferencias de datos personales con las dependencias o entidades de la Administración Pública del Estado y los sujetos obligados por la Ley; así como se podrán hacer transferencias de datos personales con las empresas culturales que forman parte del Proyecto CulturAll Access, para brindar la atención, seguimiento y respuesta a solicitudes dentro del Proyecto.
                   </p>
                   <p className="text-lg leading-relaxed mt-4">
                     El Tratamiento de Datos Personales se realiza con fundamento en los artículos 6 y 16 segundo párrafo de la Constitución Política de los Estados Unidos Mexicanos; 6 y 15 de la Constitución Política del Estado Libre y Soberano de Nuevo León, 3 fracción XXXIII, 4, 16, 17, 18, 27, 28 y demás relativos de la Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados.
                   </p>
                 </div>

                 <div className="mt-8">
                   <h3 className="text-2xl font-bold text-black mb-4">
                     Mecanismos para el ejercicio de los derechos ARCO.
                   </h3>
                   <p className="text-lg leading-relaxed">
                     Los titulares de los datos personales podrán ejercer los derechos ARCO (Acceso, Rectificación, Cancelación u Oposición), directamente ante la Unidad de Transparencia de la Secretaría de Cultura del Estado de Nuevo León, con domicilio en con domicilio en calle 5 de Mayo, número 525, Edificio Elizondo Páez Primer Piso, colonia Centro, C.P. 64000, en Monterrey, Nuevo León, CP 64000 o por medio electrónico en el correo culturatransparente@nuevoleon.gob.mx.
                   </p>
                   <p className="text-lg leading-relaxed mt-4">
                     Aunado a lo anterior, usted tiene el derecho de acceder a los datos personales que obren en posesión de la Secretaría de Cultura y a conocer la información relacionada con las condiciones y generalidades de su tratamiento (Acceso).
                   </p>
                   <p className="text-lg leading-relaxed mt-4">
                     En caso de que su información de carácter personal se encuentre desactualizada, inexacta o incompleta, es su derecho solicitar la corrección de la misma (Rectificación). Igualmente, puede solicitar que se elimine su información de nuestras bases de datos o sistemas de tratamiento, cuando considere que la misma no está siendo utilizada conforme a los principios, deberes y obligaciones previstos en los Lineamientos sobre principios y deberes de protección de datos personales en posesión de los sujetos obligados, así como en la Ley de Protección de Datos Personales en Posesión de los Sujetos Obligados del Estado de Nuevo León y la Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados. También, cuando hayan dejado de ser necesarios para la finalidad para la cual fueron recabados (Cancelación). Asimismo, usted puede oponerse al uso de sus datos personales para fines específicos (Oposición). Estos derechos, se conocen comúnmente como derechos ARCO.
                   </p>
                   <p className="text-lg leading-relaxed mt-4">
                     El procedimiento para el ejercicio de estos derechos se encuentra regulado en el Título Tercero, Capítulo Segundo de la Ley de Protección de Datos Personales en Posesión de Sujetos Obligados del Estado de Nuevo León; así como en el Título Tercero, Capítulo Segundo de la Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados.
                   </p>
                 </div>

                 <div className="mt-8">
                   <h3 className="text-2xl font-bold text-black mb-4">
                     Domicilio del responsable de los Datos Personales
                   </h3>
                   <p className="text-lg leading-relaxed">
                     Calle 5 de Mayo, número 525, Edificio Elizondo Páez Primer Piso, colonia Centro, C.P. 64000, en Monterrey, Nuevo León, CP 64000 o por medio electrónico en el correo culturatransparente@nuevoleon.gob.mx.
                   </p>
                   <p className="text-lg leading-relaxed mt-4">
                     De conformidad con los artículos 52 de la Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados y 63, de la Ley De Protección De Datos Personales En Posesión De Sujetos Obligados Del Estado De Nuevo León, en la solicitud para el ejercicio de los derechos ARCO no podrán imponerse mayores requisitos que los siguientes:
                   </p>
                   <ol className="list-decimal list-inside text-lg leading-relaxed space-y-2 mt-4 ml-4">
                     <li>El nombre del titular y su domicilio o cualquier otro medio para recibir notificaciones;</li>
                     <li>Los documentos que acrediten la identidad del titular y, en su caso, la personalidad e identidad de su representante;</li>
                     <li>De ser posible, el área responsable que trata los datos personales y ante el cual se presenta la solicitud;</li>
                     <li>La descripción clara y precisa de los datos personales respecto de los que se busca ejercer alguno de los derechos ARCO, salvo que se trate del derecho de acceso;</li>
                     <li>La descripción del derecho ARCO que se pretende ejercer, o bien, lo que solicita el titular, y</li>
                     <li>Cualquier otro elemento o documento que facilite la localización de los datos personales, en su caso.</li>
                   </ol>
                 </div>

                 <div className="mt-8">
                   <h3 className="text-2xl font-bold text-black mb-4">
                     Cambios en el aviso de privacidad.
                   </h3>
                   <p className="text-lg leading-relaxed">
                     En caso de que exista un cambio de este aviso de privacidad, lo haremos de su conocimiento en el portal de internet del Gobierno del Estado, en la sección de transparencia de la Secretaría de Cultura, ubicado en el internet: <a href="https://www.nl.gob.mx/es/avisosdeprivacidad-cultura" className="text-black hover:text-black">https://www.nl.gob.mx/es/avisosdeprivacidad-cultura</a>
                   </p>
                 </div>

                 <div className="mt-8">
                   <h3 className="text-2xl font-bold text-black mb-4">
                     Fecha de actualización.
                   </h3>
                   <p className="text-lg leading-relaxed">
                     01 de julio de 2025.
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

export default AvisoPrivacidad;
