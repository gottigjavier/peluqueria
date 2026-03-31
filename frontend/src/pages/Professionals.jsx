import { useState, useEffect } from 'react';
import { professionalsApi } from '../hooks/useApi';
import { Plus, Edit } from 'lucide-react';

export default function Professionals() {
  const [professionals, setProfessionals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', specialty: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { loadProfessionals(); }, []);
  const loadProfessionals = () => professionalsApi.getAll().then(res => setProfessionals(res.data)).catch(console.error);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) await professionalsApi.update(editingId, formData);
      else await professionalsApi.create(formData);
      setShowModal(false); setFormData({ name: '', specialty: '' }); setEditingId(null); loadProfessionals();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (p) => { setFormData({ name: p.name, specialty: p.specialty || '' }); setEditingId(p.id); setShowModal(true); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Profesionales</h1>
        <button onClick={() => { setShowModal(true); setEditingId(null); setFormData({ name: '', specialty: '' }); }} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Nuevo</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {professionals.map(p => (
          <div key={p.id} className="card p-4 flex items-center justify-between">
            <div><h3 className="font-semibold">{p.name}</h3><p className="text-sm text-[var(--color-text-secondary)]">{p.specialty || 'Sin especialidad'}</p></div>
            <button onClick={() => handleEdit(p)} className="p-2 hover:bg-[var(--color-border)] rounded"><Edit className="w-4 h-4" /></button>
          </div>
        ))}
        {professionals.length === 0 && <p className="text-center text-[var(--color-text-secondary)] col-span-full py-8">No hay profesionales</p>}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">{editingId ? 'Editar' : 'Nuevo'} Profesional</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="label">Nombre</label><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input" required /></div>
              <div><label className="label">Especialidad</label><input type="text" value={formData.specialty} onChange={e => setFormData({...formData, specialty: e.target.value})} className="input" /></div>
              <div className="flex gap-3 pt-4"><button type="submit" className="btn-primary flex-1">Guardar</button><button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancelar</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}