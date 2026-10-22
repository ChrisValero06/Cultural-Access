import React, { useState } from 'react';
import CampanasLista from './CampanasLista';
import CampanaEditor from './CampanaEditor';
import SuscriptoresNewsletter from './SuscriptoresNewsletter';

const NewsletterAdmin = () => {
  const [vista, setVista] = useState('campanas');
  // null = lista, 'nueva' = campaña nueva, número = id en edición
  const [editando, setEditando] = useState(null);

  const subTab = (id, label) => (
    <button
      onClick={() => { setVista(id); setEditando(null); }}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        vista === id ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-700 hover:bg-orange-100'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div>
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
        {subTab('campanas', 'Campañas')}
        {subTab('suscriptores', 'Suscriptores')}
      </div>

      {vista === 'campanas' && editando === null && (
        <CampanasLista
          onNueva={() => setEditando('nueva')}
          onEditar={(id) => setEditando(id)}
        />
      )}
      {vista === 'campanas' && editando !== null && (
        <CampanaEditor
          campanaId={editando === 'nueva' ? null : editando}
          onVolver={() => setEditando(null)}
        />
      )}
      {vista === 'suscriptores' && <SuscriptoresNewsletter />}
    </div>
  );
};

export default NewsletterAdmin;
