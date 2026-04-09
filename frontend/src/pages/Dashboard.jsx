import { useState, useEffect } from 'react';
import { clientsApi, appointmentsApi, servicesApi, resourcesApi, professionalsApi, salesApi } from '../hooks/useApi';
import { Users, Calendar, Scissors, TrendingUp, X } from 'lucide-react';
import { formatDateTime, formatTime, formatDate } from '../utils/dateUtils';

export default function Dashboard() {
  const [stats, setStats] = useState({ clients: 0, appointments: 0, services: 0, sales: 0, pendingCount: 0, inProgressCount: 0 });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [servicesMap, setServicesMap] = useState({});
  const [clientsMap, setClientsMap] = useState({});
  const [professionalsMap, setProfessionalsMap] = useState({});
  const [resourcesMap, setResourcesMap] = useState({});
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailAppointment, setDetailAppointment] = useState(null);
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date().toISOString()));
  const [showDatePicker, setShowDatePicker] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const today = formatDate(new Date().toISOString());
  const isToday = selectedDate === today;

  useEffect(() => {
    Promise.all([
      clientsApi.getAll(),
      appointmentsApi.getAll(),
      servicesApi.getAll(),
      resourcesApi.getAll(),
      professionalsApi.getAll(),
      salesApi.getCompletedAppointments({ start_date: todayStr + 'T00:00:00', end_date: todayStr + 'T23:59:59' })
    ]).then(([clientsRes, appointmentsRes, servicesRes, resourcesRes, professionalsRes, salesRes]) => {
      const sDict = {}; servicesRes.data.forEach(s => sDict[s.id] = s);
      const cDict = {}; clientsRes.data.forEach(c => cDict[c.id] = c);
      const pDict = {}; professionalsRes.data.forEach(p => pDict[p.id] = p);
      const rDict = {}; resourcesRes.data.forEach(r => rDict[r.id] = r);
      
      setServicesMap(sDict);
      setClientsMap(cDict);
      setProfessionalsMap(pDict);
      setResourcesMap(rDict);
      
      const todayAppointments = appointmentsRes.data.filter(a => {
        const aptDate = formatDate(a.start_time);
        return aptDate === today;
      });
      
      const pendingCount = todayAppointments.filter(a => a.status === 'pending').length;
      const inProgressCount = todayAppointments.filter(a => a.status === 'in_progress').length;
      
      const todaySales = salesRes.data.reduce((sum, s) => sum + s.amount, 0);
      
      setStats({
        clients: clientsRes.data.length,
        appointments: pendingCount + inProgressCount,
        services: servicesRes.data.length,
        sales: todaySales,
        pendingCount,
        inProgressCount
      });
      
      const activeTodayAppointments = todayAppointments.filter(a => a.status === 'pending' || a.status === 'in_progress');
      setRecentAppointments(activeTodayAppointments);
    }).catch(console.error);
  }, [today, todayStr]);

  useEffect(() => {
    appointmentsApi.getAll().then(res => {
      const filtered = res.data.filter(apt => {
        const aptDate = formatDate(apt.start_time);
        const isActive = apt.status === 'pending' || apt.status === 'in_progress';
        return isActive && aptDate === selectedDate;
      });
      setRecentAppointments(filtered);
      
      const pendingCount = filtered.filter(a => a.status === 'pending').length;
      const inProgressCount = filtered.filter(a => a.status === 'in_progress').length;
      setStats(prev => ({ ...prev, appointments: filtered.length, pendingCount, inProgressCount }));
    }).catch(console.error);
  }, [selectedDate]);

  const handleDateChange = (e) => {
    const newDateStr = e.target.value;
    const parts = newDateStr.split('-');
    const newDate = new Date(parts[0], parts[1] - 1, parts[2]);
    setSelectedDate(formatDate(newDate.toISOString()));
  };

  const parseDateForInput = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('/');
    if (parts.length !== 3) return '';
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  };

  const handleViewDetail = (apt) => {
    setDetailAppointment(apt);
    setShowDetailModal(true);
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

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'in_progress': return 'En curso';
      case 'pending': return 'Pendiente';
      case 'confirmed': return 'Confirmado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const cards = [
    { title: 'Clientes', value: stats.clients, icon: Users, color: 'text-blue-500' },
    { 
      title: 'Turnos', 
      pendingValue: stats.pendingCount, 
      inProgressValue: stats.inProgressCount, 
      icon: Calendar, 
      color: isToday ? 'text-green-500' : 'text-orange-500', 
      onClick: () => setShowDatePicker(!showDatePicker) 
    },
    { title: 'Servicios', value: stats.services, icon: Scissors, color: 'text-purple-500' },
    { title: 'Ventas', value: `$${stats.sales.toLocaleString('es-AR')}`, icon: TrendingUp, color: 'text-[var(--color-accent)]' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map(card => (
          <div 
            key={card.title} 
            className={`card p-6 ${card.onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
            onClick={card.onClick}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-text-secondary)]">{card.title}</p>
                {card.value !== undefined && <p className="text-2xl font-bold mt-1">{card.value}</p>}
                {card.pendingValue !== undefined && (
                  <>
                    <p className="text-sm mt-1">
                      Pendientes: <span className="font-bold text-yellow-700 dark:text-yellow-300">{card.pendingValue}</span>
                    </p>
                    <p className="text-sm">
                      En curso: <span className="font-bold text-blue-700 dark:text-blue-300">{card.inProgressValue}</span>
                    </p>
                  </>
                )}
              </div>
              <card.icon className={`w-8 h-8 ${card.color}`} />
            </div>
          </div>
        ))}
      </div>

      {showDatePicker && (
        <div className="mb-4 p-4 bg-[var(--color-card)] rounded-lg border border-[var(--color-border)]">
          <label className="block text-sm font-medium mb-2">Seleccionar fecha:</label>
          <input 
            type="date" 
            onChange={handleDateChange}
            className="p-2 border rounded-lg bg-[var(--color-bg)] text-[var(--color-text)]"
            value={parseDateForInput(selectedDate)}
          />
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Mostrando turnos de: {selectedDate}
          </p>
        </div>
      )}

      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4">Turnos del Día</h2>
        {recentAppointments.length === 0 ? (
          <p className="text-[var(--color-text-secondary)]">No hay turnos registrados</p>
        ) : (
          <div className="space-y-3">
            {recentAppointments.map(apt => (
              <div 
                key={apt.id} 
                onClick={() => handleViewDetail(apt)}
                className="flex items-center justify-between p-3 bg-[var(--color-bg)] rounded-lg cursor-pointer hover:bg-[var(--color-border)] transition-colors"
              >
                <div>
                  <p className="font-medium">{servicesMap[apt.service_id]?.name || `Servicio ${apt.service_id}`}</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {formatTime(apt.start_time).split(' ')[0]}
                  </p>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {formatTime(apt.start_time).split(' ')[1]} - {formatTime(apt.end_time).split(' ')[1]}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(apt.status)}`}>
                  {getStatusLabel(apt.status)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

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
                <span className="font-medium">{servicesMap[detailAppointment.service_id]?.name || `Servicio ${detailAppointment.service_id}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Profesional:</span>
                <span className="font-medium">{professionalsMap[detailAppointment.professional_id]?.name || `Profesional ${detailAppointment.professional_id}`}</span>
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
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(detailAppointment.status)}`}>{getStatusLabel(detailAppointment.status)}</span>
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
            
            <div className="mt-6">
              <button onClick={() => setShowDetailModal(false)} className="btn-primary w-full">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
