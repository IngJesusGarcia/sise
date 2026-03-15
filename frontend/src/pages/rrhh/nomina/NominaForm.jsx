import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, DollarSign } from 'lucide-react';
import nominaService from '../../../services/nominaService';
import { Card, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { FormGroup, Label, Input, Select } from '../../../components/ui/Form';

const NominaForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    periodo: '',
    tipo: 'quincenal',
    fecha_inicio: '',
    fecha_fin: '',
    fecha_pago: '',
  });

  const handleChange = e => setFormData({ ...formData, [e.target.id]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const nomina = await nominaService.create(formData);
      navigate(`/rrhh/nominas/${nomina.id}`);
    } catch (err) {
      alert(err.response?.data?.message ?? 'Error al generar la nómina.');
    } finally { setLoading(false); }
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <button onClick={() => navigate('/rrhh/nominas')} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors text-gray-500">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Generar Nómina</h1>
          <p className="text-gray-500 text-sm">Se generará una línea por cada empleado activo en el sistema automáticamente.</p>
        </div>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
        📋 <strong>Proceso automático:</strong> Al generar la nómina, el sistema calculará el sueldo base de cada empleado activo según su contrato vigente, aplicando una deducción estimada del <strong>11.75% (IMSS)</strong>. Podrás ajustar los montos individuales después de generarla.
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="p-8 space-y-5">
            <FormGroup>
              <Label htmlFor="periodo">Nombre del Periodo</Label>
              <Input id="periodo" value={formData.periodo} onChange={handleChange} required
                className="font-semibold" placeholder="Ej. Quincena 1 - Marzo 2026" />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="tipo">Tipo de Nómina</Label>
              <Select id="tipo" value={formData.tipo} onChange={handleChange}>
                <option value="quincenal">Quincenal</option>
                <option value="mensual">Mensual</option>
                <option value="semanal">Semanal</option>
              </Select>
            </FormGroup>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormGroup>
                <Label htmlFor="fecha_inicio">Inicio del Periodo</Label>
                <Input id="fecha_inicio" type="date" value={formData.fecha_inicio} onChange={handleChange} required />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="fecha_fin">Fin del Periodo</Label>
                <Input id="fecha_fin" type="date" value={formData.fecha_fin} onChange={handleChange} required />
              </FormGroup>
              <FormGroup className="md:col-span-2">
                <Label htmlFor="fecha_pago">Fecha de Pago</Label>
                <Input id="fecha_pago" type="date" value={formData.fecha_pago} onChange={handleChange} required />
              </FormGroup>
            </div>
          </CardContent>
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => navigate('/rrhh/nominas')}>Cancelar</Button>
            <Button variant="primary" type="submit" isLoading={loading} icon={DollarSign}>
              Generar Nómina para Todos los Empleados
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default NominaForm;
