import { useState, useEffect } from 'react';
import { resourcesApi } from '../hooks/useApi';
import { Plus, Edit } from 'lucide-react';

const resourceTypes = ['chair', 'bed', 'cabin', 'station'];

export default function Resources() {
  const [resources, setResources] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', resource_type: 'chair', location: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { loadResources(); }, []);
  const loadResources = () => resourcesApi.getAll().then(res => setResources(res.data)).catch(console.error);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) await resourcesApi.update(editingId, formData);
      else await resourcesApi.create(formData);
      setShowModal(false); setFormData({ name: '', resource_type: 'chair', location: '' }); setEditingId(null); loadResources();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (r) => { setFormData({ name: r.name, resource_type: r.resource_type, location: r.location || '' }); setEditingId(r.id); setShowModal(true); };

  const getTypeIcon = (type) => { const icons = { chair: '🪑', bed: '🛏️', cabin: '🚪', station: '💅' }; return icons[type] || '📦'; };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Recursos</h1>
        <button onClick={() => { setShowModal(true); setEditingId(null); setFormData({ name: '', resource_type: 'chair', location: '' }); }} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Nuevo</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {resources.map(r => (
          <div key={r.id} className="card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getTypeIcon(r.resource_type)}</span>
              <div><h3 className="font-semibold">{r.name}</h3><p className="text-sm text-[var(--color-text-secondary)]">{r.resource_type} {r.location && `| ${r.location}`}</p></div>
            </div>
            <button onClick={() => handleEdit(r)} className="p-2 hover:bg-[var(--color-border)] rounded"><Edit className="w-4 h-4" /></button>
          </div>
        ))}
        {resources.length === 0 && <p className="text-center text-[var(--color-text-secondary)] col-span-full py-8">No hay recursos</p>}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">{editingId ? 'Editar' : 'Nuevo'} Recurso</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="label">Nombre</label><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input" required /></div>
              <div><label className="label">Tipo</label><select value={formData.resource_type} onChange={e => setFormData({...formData, resource_type: e.target.value})} className="input">{resourceTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              <div><label className="label">Ubicación</label><input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="input" /></div>
              <div className="flex gap-3 pt-4"><button type="submit" className="btn-primary flex-1">Guardar</button><button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancelar</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}