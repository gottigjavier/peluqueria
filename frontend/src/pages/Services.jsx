import { useState, useEffect } from 'react';
import { servicesApi } from '../hooks/useApi';
import { Plus, Edit, Trash2 } from 'lucide-react';

const categories = ['haircut', 'color', 'makeup', 'nails', 'massage', 'other'];
const resourceTypes = ['chair', 'bed', 'cabin', 'station'];

export default function Services() {
  const [services, setServices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', category: 'haircut', duration_minutes: 30, price: 0, description: '', required_resource_type: 'chair' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { loadServices(); }, []);

  const loadServices = () => servicesApi.getAll().then(res => setServices(res.data)).catch(console.error);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) await servicesApi.update(editingId, formData);
      else await servicesApi.create(formData);
      setShowModal(false);
      setFormData({ name: '', category: 'haircut', duration_minutes: 30, price: 0, description: '', required_resource_type: 'chair' });
      setEditingId(null);
      loadServices();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (service) => {
    setFormData({ name: service.name, category: service.category, duration_minutes: service.duration_minutes, price: service.price, description: service.description || '', required_resource_type: service.required_resource_type || 'chair' });
    setEditingId(service.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar servicio?')) { await servicesApi.delete(id); loadServices(); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Servicios</h1>
        <button onClick={() => { setShowModal(true); setEditingId(null); setFormData({ name: '', category: 'haircut', duration_minutes: 30, price: 0, description: '', required_resource_type: 'chair' }); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nuevo Servicio
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map(service => (
          <div key={service.id} className="card p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">{service.name}</h3>
              <span className="text-[var(--color-accent)] font-bold">${service.price}</span>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)] mb-2">{service.category} | {service.duration_minutes}min</p>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">Recurso: {service.required_resource_type || 'cualquiera'}</p>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(service)} className="btn-secondary flex-1 text-sm">Editar</button>
              <button onClick={() => handleDelete(service.id)} className="btn-secondary text-red-500 text-sm">Eliminar</button>
            </div>
          </div>
        ))}
        {services.length === 0 && <p className="text-center text-[var(--color-text-secondary)] col-span-full py-8">No hay servicios registrados</p>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">{editingId ? 'Editar Servicio' : 'Nuevo Servicio'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="label">Nombre</label><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input" required /></div>
              <div><label className="label">Categoría</label><select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="input">{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              <div><label className="label">Duración (minutos)</label><input type="number" value={formData.duration_minutes} onChange={e => setFormData({...formData, duration_minutes: parseInt(e.target.value)})} className="input" required /></div>
              <div><label className="label">Precio</label><input type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} className="input" required /></div>
              <div><label className="label">Recurso Requerido</label><select value={formData.required_resource_type} onChange={e => setFormData({...formData, required_resource_type: e.target.value})} className="input">{resourceTypes.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
              <div><label className="label">Descripción</label><textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="input" rows="2" /></div>
              <div className="flex gap-3 pt-4"><button type="submit" className="btn-primary flex-1">Guardar</button><button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancelar</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}