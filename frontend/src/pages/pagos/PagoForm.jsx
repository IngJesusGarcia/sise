import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Save, DollarSign } from 'lucide-react';
import pagosService from '../../services/pagosService';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { FormGroup, Label, Input, Select } from '../../components/ui/Form';

const PagoForm = () => {
  const navigate = useNavigate();

  const [estudiantes, setEstudiantes] = useState([]);
  const [formData, setFormData] = useState({
    estudiante_id: '',
    concepto: 'Inscripción',
    monto: '',
    fecha_pago: new Date().toISOString().split('T')[0],
    metodo_pago: 'Transferencia',
    referencia: '',
    estatus: 'pagado'
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEstudiantes();
  }, []);

  const loadEstudiantes = async () => {
    try {
      const data = await pagosService.getEstudiantes();
      setEstudiantes(data);
    } catch (error) {
      console.error('Error fetching catalog', error);
      alert('Error de conexión.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.estudiante_id || !formData.monto) {
      alert('Llene los campos obligatorios del ingreso.');
      return;
    }
    setLoading(true);
    
    try {
      await pagosService.create(formData);
      navigate('/pagos'); // Redirecciona de vuelta
    } catch (error) {
      alert(error.response?.data?.error || 'Error al procesar registro en caja.');
    } finally {
      setLoading(false);
    }
  };

  const handleConceptoChange = (e) => {
    const concept = e.target.value;
    let autoMonto = '';
    
    if (concept === 'Inscripción') autoMonto = '1500.00';
    if (concept === 'Reinscripción') autoMonto = '1200.00';
    if (concept === 'Constancia') autoMonto = '150.00';
    if (concept === 'Examen Extraordinario') autoMonto = '300.00';
    if (concept === 'Titulación') autoMonto = '5500.00';

    setFormData({...formData, concepto: concept, monto: autoMonto });
  };

  return (
    <div className="animate-fade-in max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <button 
          onClick={() => navigate('/pagos')}
          className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 text-gray-500 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Registrar Ingreso</h1>
          <p className="text-gray-500 text-sm">
            Caja departamental - Registra un pago y emite la referencia oficial.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-t-4 border-t-green-500">
          <CardContent className="p-8 space-y-6">
            
            <FormGroup>
                <Label htmlFor="estudiante_id">Buscar Contribuyente (Estudiante)</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="text-gray-400" size={18} />
                  </div>
                  <Select 
                    id="estudiante_id"
                    value={formData.estudiante_id}
                    onChange={(e) => setFormData({...formData, estudiante_id: e.target.value})}
                    className="pl-10"
                    required
                  >
                    <option value="">Buscar matrícula o nombre del padrón general...</option>
                    {estudiantes.map(e => (
                      <option key={e.id} value={e.id}>
                        {e.matricula} — {e.nombre} {e.apellido_paterno} 
                      </option>
                    ))}
                  </Select>
                </div>
            </FormGroup>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormGroup>
                    <Label htmlFor="concepto">Concepto (Catálogo Servicios)</Label>
                    <Select 
                      id="concepto"
                      value={formData.concepto}
                      onChange={handleConceptoChange}
                    >
                      <option value="Inscripción">Inscripción</option>
                      <option value="Reinscripción">Reinscripción</option>
                      <option value="Constancia">Constancia de Estudios</option>
                      <option value="Examen Extraordinario">Examen Extraordinario</option>
                      <option value="Titulación">Trámite de Titulación</option>
                      <option value="Otro">Otro (Especifique Manualmente)</option>
                    </Select>
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="monto">Monto Efectivo (MXN)</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="text-gray-400" size={18} />
                      </div>
                      <Input 
                        id="monto"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.monto}
                        onChange={(e) => setFormData({...formData, monto: e.target.value})}
                        className="pl-10 font-mono font-bold text-green-700 bg-green-50/50"
                        required
                        placeholder="0.00"
                      />
                    </div>
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="metodo_pago">Vía de Ingreso</Label>
                    <Select 
                      id="metodo_pago"
                      value={formData.metodo_pago}
                      onChange={(e) => setFormData({...formData, metodo_pago: e.target.value})}
                    >
                      <option value="Transferencia">Transferencia Electrónica</option>
                      <option value="Ventanilla">Ventanilla Bancaria</option>
                      <option value="Tarjeta">Terminal POS (Tarjeta)</option>
                      <option value="Efectivo">Caja / Efectivo</option>
                    </Select>
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="referencia">No. Referencia o Autorización</Label>
                    <Input 
                        id="referencia"
                        type="text"
                        value={formData.referencia}
                        onChange={(e) => setFormData({...formData, referencia: e.target.value})}
                        className="font-mono text-sm uppercase"
                        placeholder="Dejar en blanco para auto-generar"
                    />
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="fecha_pago">Fecha de Aplicación</Label>
                    <Input 
                        id="fecha_pago"
                        type="date"
                        value={formData.fecha_pago}
                        onChange={(e) => setFormData({...formData, fecha_pago: e.target.value})}
                        required
                    />
                </FormGroup>
            </div>
            
          </CardContent>
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-end gap-3">
             <Button variant="outline" type="button" onClick={() => navigate('/pagos')}>
               Cancelar
             </Button>
             <Button variant="primary" type="submit" isLoading={loading} icon={Save}>
               Registrar Comprobante
             </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default PagoForm;
