import { useState, useEffect } from 'react';
import { appointmentsApi, clientsApi, servicesApi, professionalsApi, resourcesApi } from '../hooks/useApi';
import { Plus, Check, X, Edit, Eye, Play } from 'lucide-react';
import { formatDateTime, formatTime } from '../utils/dateUtils';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [detailAppointment, setDetailAppointment] = useState(null);
  const [formData, setFormData] = useState({ client_id: '', service_id: '', professional_id: '', start_date: '', start_time: '', notes: '' });
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState([]);
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [servicesMap, setServicesMap] = useState({});
  const [clientsMap, setClientsMap] = useState({});
  const [professionalsMap, setProfessionalsMap] = useState({});
  const [resourcesMap, setResourcesMap] = useState({});
  const [clientFilter, setClientFilter] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    Promise.all([
      appointmentsApi.getAll(),
      clientsApi.getAll(),
      servicesApi.getAll(),
      professionalsApi.getAll(),
      resourcesApi.getAll()
    ]).then(([aptRes, cRes, sRes, pRes, rRes]) => {
      setAppointments(aptRes.data);
      setClients(cRes.data);
      setServices(sRes.data);
      setProfessionals(pRes.data);
      
      const sDict = {}; sRes.data.forEach(s => sDict[s.id] = s);
      const cDict = {}; cRes.data.forEach(c => cDict[c.id] = c);
      const pDict = {}; pRes.data.forEach(p => pDict[p.id] = p);
      const rDict = {}; rRes.data.forEach(r => rDict[r.id] = r);
      setServicesMap(sDict);
      setClientsMap(cDict);
      setProfessionalsMap(pDict);
      setResourcesMap(rDict);
    }).catch(console.error);
  };

  const checkServicesAvailability = async () => {
    if (!formData.start_date || !formData.start_time) {
      alert('Seleccione fecha y hora primero');
      return;
    }
    const localDateTime = `${formData.start_date}T${formData.start_time}:00`;
    try {
      const res = await appointmentsApi.checkServices({ start_time: localDateTime });
      setFilteredServices(res.data.available_services || []);
      setAvailabilityChecked(true);
      setFilteredProfessionals([]);
      setSelectedService(null);
      setFormData(prev => ({ ...prev, service_id: '', professional_id: '' }));
    } catch (err) {
      alert('Error al verificar disponibilidad de servicios');
      setFilteredServices([]);
      setAvailabilityChecked(false);
    }
  };

  const checkProfessionalsAvailability = async (startDate, startTime, serviceId) => {
    if (!startDate || !startTime || !serviceId) {
      return;
    }
    const localDateTime = `${startDate}T${startTime}:00`;
    const serviceIdInt = parseInt(serviceId);
    try {
      const res = await appointmentsApi.checkProfessionals({ 
        start_time: localDateTime, 
        service_id: serviceIdInt
      });
      setFilteredProfessionals(res.data.available_professionals || []);
    } catch (err) {
      setFilteredProfessionals([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const localDateTime = formData.start_date && formData.start_time 
        ? `${formData.start_date}T${formData.start_time}:00`
        : null;
      const payload = {
        client_id: parseInt(formData.client_id),
        service_id: parseInt(formData.service_id),
        professional_id: parseInt(formData.professional_id),
        start_time: localDateTime,
        notes: formData.notes || null
      };
      
      if (editingAppointment) {
        await appointmentsApi.update(editingAppointment.id, payload);
      } else {
        await appointmentsApi.create(payload);
      }
      
      setShowModal(false);
      setEditingAppointment(null);
setFormData({ client_id: '', service_id: '', professional_id: '', start_date: '', start_time: '', notes: '' });
      setClientFilter('');
      loadData();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.detail || 'Verificar disponibilidad'));
    }
  };

  const handleEdit = (apt) => {
    setEditingAppointment(apt);
    const dateStr = apt.start_time;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateStr);
      return;
    }
    const datePart = date.toISOString().split('T')[0];
    const timePart = date.toTimeString().slice(0, 5);
    setFormData({
      client_id: apt.client_id.toString(),
      service_id: apt.service_id.toString(),
      professional_id: apt.professional_id.toString(),
      start_date: datePart,
      start_time: timePart,
      notes: apt.notes || ''
    });
    setAvailabilityChecked(false);
    setSelectedService(null);
    setShowModal(true);
  };

  const handleViewDetail = (apt) => {
    setDetailAppointment(apt);
    setShowDetailModal(true);
  };

  const handleStart = async (id) => {
    await appointmentsApi.start(id);
    loadData();
  };

  const handleComplete = async (id) => {
    await appointmentsApi.complete(id);
    loadData();
  };

  const handleCancel = async (id) => {
    if (confirm('¿Cancelar turno?')) {
      await appointmentsApi.delete(id);
      loadData();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Turnos</h1>
        <button onClick={() => { setEditingAppointment(null); setFormData({ client_id: '', service_id: '', professional_id: '', start_date: '', start_time: '', notes: '' }); setAvailabilityChecked(false); setFilteredServices([]); setFilteredProfessionals([]); setSelectedService(null); setClientFilter(''); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nuevo Turno
        </button>
      </div>

      <div className="space-y-4">
        {appointments.map(apt => (
          <div key={apt.id} onClick={() => handleViewDetail(apt)} className="card p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow">
            <div>
              <p className="font-semibold">Turno #{apt.id}</p>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {formatTime(apt.start_time).split(' ')[0]}
              </p>
              <p className="text-sm">
                {formatTime(apt.start_time).split(' ')[1]} - {formatTime(apt.end_time).split(' ')[1]}
              </p>
              <p className="text-sm">Servicio: {servicesMap[apt.service_id]?.name || `Servicio ${apt.service_id}`} | Cliente: {clientsMap[apt.client_id]?.name || `Cliente ${apt.client_id}`}</p>
            </div>
            <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
              <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(apt.status)}`}>{apt.status === 'in_progress' ? 'En curso' : apt.status === 'pending' ? 'Pendiente' : apt.status === 'completed' ? 'Completado' : apt.status === 'cancelled' ? 'Cancelado' : apt.status}</span>
              {apt.status === 'pending' && (
                <>
                  <button onClick={() => handleEdit(apt)} className="p-2 bg-blue-100 dark:bg-blue-900 rounded text-blue-600"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleStart(apt.id)} className="p-2 bg-purple-100 dark:bg-purple-900 rounded text-purple-600" title="Iniciar turno"><Play className="w-4 h-4" /></button>
                  <button onClick={() => handleCancel(apt.id)} className="p-2 bg-red-100 dark:bg-red-900 rounded text-red-600" title="Cancelar turno"><X className="w-4 h-4" /></button>
                </>
              )}
              {apt.status === 'in_progress' && (
                <>
                  <button onClick={() => handleComplete(apt.id)} className="p-2 bg-green-100 dark:bg-green-900 rounded text-green-600" title="Completar turno"><Check className="w-4 h-4" /></button>
                  <button onClick={() => handleCancel(apt.id)} className="p-2 bg-red-100 dark:bg-red-900 rounded text-red-600" title="Cancelar turno"><X className="w-4 h-4" /></button>
                </>
              )}
            </div>
          </div>
        ))}
        {appointments.length === 0 && <p className="text-center text-[var(--color-text-secondary)] py-8">No hay turnos registrados</p>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">{editingAppointment ? 'Editar Turno' : 'Nuevo Turno'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="label">Fecha</label>
                  <input 
                    type="date" 
                    value={formData.start_date || ''} 
                    onChange={e => { setFormData({...formData, start_date: e.target.value}); setAvailabilityChecked(false); setFilteredProfessionals([]); setSelectedService(null); }} 
                    className="input" 
                    required 
                  />
                </div>
                <div className="flex-1">
                  <label className="label">Hora</label>
                  <div className="flex gap-2">
                    <select 
                      value={formData.start_time ? formData.start_time.split(':')[0] || '' : ''} 
                      onChange={e => {
                        const minute = formData.start_time ? formData.start_time.split(':')[1] || '00' : '00';
                        setFormData({...formData, start_time: `${e.target.value}:${minute}`});
                        setAvailabilityChecked(false);
                        setFilteredProfessionals([]);
                      }} 
                      className="input" 
                      required 
                    >
                      <option value="">Hora</option>
                      {Array.from({length: 24}, (_, i) => (
                        <option key={i} value={String(i).padStart(2, '0')}>{String(i).padStart(2, '0')}</option>
                      ))}
                    </select>
                    <select 
                      value={formData.start_time ? formData.start_time.split(':')[1] || '00' : ''} 
                      onChange={e => {
                        const hour = formData.start_time ? formData.start_time.split(':')[0] || '00' : '00';
                        setFormData({...formData, start_time: `${hour}:${e.target.value}`});
                        setAvailabilityChecked(false);
                        setFilteredProfessionals([]);
                      }} 
                      className="input" 
                      required 
                    >
                      <option value="">Min</option>
                      {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              {!editingAppointment && (
                <button 
                  type="button" 
                  onClick={checkServicesAvailability}
                  disabled={!formData.start_date || !formData.start_time}
                  className="btn-secondary w-full"
                >
                  Ver Servicios Disponibles
                </button>
              )}
              {!editingAppointment && availabilityChecked && filteredServices.length === 0 && (
                <p className="text-sm text-red-500 text-center">
                  No hay servicios disponibles en este horario
                </p>
              )}
              <div>
                <label className="label">Servicio</label>
                <select 
                  value={formData.service_id} 
                  onChange={e => {
                    const serviceId = e.target.value;
                    const date = formData.start_date;
                    const time = formData.start_time;
                    setFormData(prev => ({ ...prev, service_id: serviceId }));
                    setSelectedService(serviceId);
                    setFilteredProfessionals([]);
                    if (serviceId && date && time) {
                      setTimeout(() => checkProfessionalsAvailability(date, time, serviceId), 0);
                    }
                  }} 
                  className="input" 
                  required
                >
                  <option value="">Seleccionar servicio</option>
                  {(editingAppointment || !availabilityChecked ? services : filteredServices).map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.duration_minutes}min)</option>
                  ))}
                </select>
              </div>
              {formData.service_id && availabilityChecked && (
                <p className="text-sm text-[var(--color-accent)]">
                  {filteredProfessionals.length > 0 ? 'Profesionales disponibles para el servicio seleccionado' : 'No hay profesionales disponibles'}
                </p>
              )}
              <div>
                <label className="label">Profesional</label>
                <select 
                  value={formData.professional_id} 
                  onChange={e => setFormData({...formData, professional_id: e.target.value})} 
                  className="input" 
                  required
                >
                  <option value="">Seleccionar profesional</option>
                  {(editingAppointment || !availabilityChecked ? professionals : filteredProfessionals).map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Cliente</label>
                <input 
                  type="text" 
                  placeholder="Buscar cliente..." 
                  value={clientFilter} 
                  onChange={e => setClientFilter(e.target.value)} 
                  className="input mb-2"
                />
                <select 
                  value={formData.client_id} 
                  onChange={e => setFormData({...formData, client_id: e.target.value})} 
                  className="input" 
                  required
                >
                  <option value="">Seleccionar cliente</option>
                  {clients.filter(c => c.name.toLowerCase().includes(clientFilter.toLowerCase()) || (c.phone && c.phone.includes(clientFilter))).map(c => (
                    <option key={c.id} value={c.id}>{c.name} {c.phone ? `(${c.phone})` : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Notas</label>
                <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="input" rows="2" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">{editingAppointment ? 'Guardar' : 'Crear Turno'}</button>
                <button type="button" onClick={() => { setShowModal(false); setEditingAppointment(null); setAvailabilityChecked(false); setSelectedService(null); setClientFilter(''); }} className="btn-secondary flex-1">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailModal && detailAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Detalle del Turno</h2>
              <button onClick={() => setShowDetailModal(false)} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)]">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">ID:</span>
                <span className="font-medium">#{detailAppointment.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Cliente:</span>
                <span className="font-medium">{clientsMap[detailAppointment.client_id]?.name || `Cliente ${detailAppointment.client_id}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Servicio:</span>
                <span className="font-medium">{servicesMap[detailAppointment.service_id]?.name || detailAppointment.service_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Profesional:</span>
                <span className="font-medium">{professionalsMap[detailAppointment.professional_id]?.name || detailAppointment.professional_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Recurso:</span>
                <span className="font-medium">{resourcesMap[detailAppointment.resource_id]?.name || `Recurso ${detailAppointment.resource_id}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Fecha:</span>
                <span className="font-medium">{formatTime(detailAppointment.start_time).split(' ')[0]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Horario:</span>
                <span className="font-medium">{formatTime(detailAppointment.start_time).split(' ')[1]} - {formatTime(detailAppointment.end_time).split(' ')[1]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Estado:</span>
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(detailAppointment.status)}`}>{detailAppointment.status}</span>
              </div>
              {detailAppointment.notes && (
                <div>
                  <span className="text-[var(--color-text-secondary)]">Notas:</span>
                  <p className="mt-1 p-2 bg-[var(--color-bg)] rounded">{detailAppointment.notes}</p>
                </div>
              )}
              {detailAppointment.price && (
                <div className="flex justify-between pt-2 border-t border-[var(--color-border)]">
                  <span className="text-[var(--color-text-secondary)]">Precio:</span>
                  <span className="font-bold text-[var(--color-accent)]">${detailAppointment.price.toLocaleString('es-AR')}</span>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowDetailModal(false); handleEdit(detailAppointment); }} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                <Edit className="w-4 h-4" /> Editar
              </button>
              <button onClick={() => setShowDetailModal(false)} className="btn-primary flex-1">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}