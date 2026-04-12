import { useState, useEffect } from 'react';
import { clientsApi } from '../hooks/useApi';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', notes: '' });
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = () => {
    clientsApi.getAll().then(res => setClients(res.data)).catch(console.error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await clientsApi.update(editingId, formData);
      } else {
        await clientsApi.create(formData);
      }
      setShowModal(false);
      setFormData({ name: '', email: '', phone: '', notes: '' });
      setEditingId(null);
      loadClients();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (client) => {
    setFormData({ name: client.name, email: client.email || '', phone: client.phone, notes: client.notes || '' });
    setEditingId(client.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar cliente?')) {
      await clientsApi.delete(id);
      loadClients();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Clientes</h1>
        <button onClick={() => { setShowModal(true); setEditingId(null); setFormData({ name: '', email: '', phone: '', notes: '' }); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nuevo Cliente
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-[var(--color-border)]">
          <input 
            type="text" 
            placeholder="Buscar por nombre o teléfono..." 
            value={filter} 
            onChange={e => setFilter(e.target.value)} 
            className="input w-full"
          />
        </div>
        <table className="w-full">
          <thead className="bg-[var(--color-bg)]">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-[var(--color-text-secondary)]">Nombre</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-[var(--color-text-secondary)]">Email</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-[var(--color-text-secondary)]">Teléfono</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-[var(--color-text-secondary)]">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {clients.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()) || (c.phone && c.phone.includes(filter))).map(client => (
              <tr key={client.id} className="hover:bg-[var(--color-bg)]">
                <td className="px-6 py-4 font-medium">{client.name}</td>
                <td className="px-6 py-4 text-[var(--color-text-secondary)]">{client.email || '-'}</td>
                <td className="px-6 py-4">{client.phone}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleEdit(client)} className="p-2 hover:bg-[var(--color-border)] rounded mr-2">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(client.id)} className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {clients.length === 0 && <p className="p-6 text-center text-[var(--color-text-secondary)]">No hay clientes registrados</p>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">{editingId ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Nombre</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input" required />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="input" />
              </div>
              <div>
                <label className="label">Teléfono</label>
                <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="input" required />
              </div>
              <div>
                <label className="label">Notas</label>
                <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="input" rows="3" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">Guardar</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}