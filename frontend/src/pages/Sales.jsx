import { useState, useEffect } from 'react';
import { salesApi, servicesApi, professionalsApi } from '../hooks/useApi';
import { formatTime } from '../utils/dateUtils';

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [services, setServices] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [filters, setFilters] = useState({
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    service_id: '',
    professional_id: ''
  });

  useEffect(() => {
    loadFilters();
  }, []);

  useEffect(() => {
    loadSales();
  }, [filters]);

  const loadFilters = () => {
    Promise.all([
      servicesApi.getAll(),
      professionalsApi.getAll()
    ]).then(([servicesRes, professionalsRes]) => {
      setServices(servicesRes.data);
      setProfessionals(professionalsRes.data);
    }).catch(console.error);
  };

  const loadSales = () => {
    const params = {};
    if (filters.start_date) params.start_date = filters.start_date + 'T00:00:00';
    if (filters.end_date) params.end_date = filters.end_date + 'T23:59:59';
    if (filters.service_id) params.service_id = parseInt(filters.service_id);
    if (filters.professional_id) params.professional_id = parseInt(filters.professional_id);

    salesApi.getCompletedAppointments(params)
      .then(res => setSales(res.data))
      .catch(console.error);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const formatTimeNoSeconds = (dateString) => {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const totalAmount = sales.reduce((sum, s) => sum + s.amount, 0);

  const handleEditAmount = (sale, newAmount) => {
    salesApi.updateAmount(sale.id, newAmount)
      .then(() => loadSales())
      .catch(err => {
        console.error('Error updating sale:', err);
        loadSales();
      });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Ventas</h1>

      <div className="card p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Desde</label>
            <input
              type="date"
              value={filters.start_date}
              onChange={e => handleFilterChange('start_date', e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label">Hasta</label>
            <input
              type="date"
              value={filters.end_date}
              onChange={e => handleFilterChange('end_date', e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label">Servicio</label>
            <select
              value={filters.service_id}
              onChange={e => handleFilterChange('service_id', e.target.value)}
              className="input"
            >
              <option value="">Todos</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Profesional</label>
            <select
              value={filters.professional_id}
              onChange={e => handleFilterChange('professional_id', e.target.value)}
              className="input"
            >
              <option value="">Todos</option>
              {professionals.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-[var(--color-bg)]">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Hora</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Servicio</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Profesional</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">Monto</th>
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-4 py-8 text-center text-[var(--color-text-secondary)]">
                  No hay ventas en el período seleccionado
                </td>
              </tr>
            ) : (
              sales.map(sale => (
                <tr key={sale.id} className="border-t border-[var(--color-border)]">
                  <td className="px-4 py-3">{formatTimeNoSeconds(sale.completed_at)}</td>
                  <td className="px-4 py-3">{sale.service_name}</td>
                  <td className="px-4 py-3">{sale.professional_name}</td>
                  <td className="px-4 py-3 text-right">
                    <input
                      type="number"
                      step="0.01"
                      defaultValue={sale.amount}
                      onBlur={(e) => handleEditAmount(sale, parseFloat(e.target.value))}
                      className="input w-24 text-right"
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {sales.length > 0 && (
            <tfoot className="bg-[var(--color-bg)] font-bold">
              <tr>
                <td colSpan="3" className="px-4 py-3 text-right">Total:</td>
                <td className="px-4 py-3 text-right">${totalAmount.toLocaleString('es-AR')}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
