import { useState, useEffect } from 'react';
import { clientsApi, appointmentsApi, servicesApi, resourcesApi, professionalsApi } from '../hooks/useApi';
import { Users, Calendar, Scissors, TrendingUp, Eye, X } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({ clients: 0, appointments: 0, services: 0, sales: 0 });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [servicesMap, setServicesMap] = useState({});
  const [clientsMap, setClientsMap] = useState({});
  const [professionalsMap, setProfessionalsMap] = useState({});
  const [resourcesMap, setResourcesMap] = useState({});
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailAppointment, setDetailAppointment] = useState(null);

  useEffect(() => {
    Promise.all([
      clientsApi.getAll(),
      appointmentsApi.getAll(),
      servicesApi.getAll(),
      resourcesApi.getAll(),
      professionalsApi.getAll()
    ]).then(([clientsRes, appointmentsRes, servicesRes, resourcesRes, professionalsRes]) => {
      const sDict = {}; servicesRes.data.forEach(s => sDict[s.id] = s);
      const cDict = {}; clientsRes.data.forEach(c => cDict[c.id] = c);
      const pDict = {}; professionalsRes.data.forEach(p => pDict[p.id] = p);
      const rDict = {}; resourcesRes.data.forEach(r => rDict[r.id] = r);
      
      setServicesMap(sDict);
      setClientsMap(cDict);
      setProfessionalsMap(pDict);
      setResourcesMap(rDict);
      
      const completedAppointments = appointmentsRes.data.filter(a => a.status === 'completed');
      const totalSales = completedAppointments.reduce((sum, apt) => {
        const service = sDict[apt.service_id];
        return sum + (service ? service.price : 0);
      }, 0);
      
      setStats({
        clients: clientsRes.data.length,
        appointments: appointmentsRes.data.length,
        services: servicesRes.data.length,
        sales: totalSales
      });
      setRecentAppointments(appointmentsRes.data.slice(0, 5));
    }).catch(console.error);
  }, []);

  const handleViewDetail = (apt) => {
    setDetailAppointment(apt);
    setShowDetailModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const cards = [
    { title: 'Clientes', value: stats.clients, icon: Users, color: 'text-blue-500' },
    { title: 'Turnos', value: stats.appointments, icon: Calendar, color: 'text-green-500' },
    { title: 'Servicios', value: stats.services, icon: Scissors, color: 'text-purple-500' },
    { title: 'Ventas', value: `$${stats.sales.toLocaleString('es-AR')}`, icon: TrendingUp, color: 'text-[var(--color-accent)]' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map(card => (
          <div key={card.title} className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-text-secondary)]">{card.title}</p>
                <p className="text-2xl font-bold mt-1">{card.value}</p>
              </div>
              <card.icon className={`w-8 h-8 ${card.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4">Turnos Recientes</h2>
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
                  <p className="font-medium">Turno #{apt.id}</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {new Date(apt.start_time).toLocaleDateString('es-AR')}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(apt.status)}`}>
                  {apt.status}
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
                <span className="font-medium">{clientsMap[detailAppointment.client_id]?.name || detailAppointment.client_id}</span>
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
                <span className="font-medium">{resourcesMap[detailAppointment.resource_id]?.name || detailAppointment.resource_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Fecha Inicio:</span>
                <span className="font-medium">{new Date(detailAppointment.start_time).toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Fecha Fin:</span>
                <span className="font-medium">{new Date(detailAppointment.end_time).toLocaleString('es-AR')}</span>
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
            
            <div className="mt-6">
              <button onClick={() => setShowDetailModal(false)} className="btn-primary w-full">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}