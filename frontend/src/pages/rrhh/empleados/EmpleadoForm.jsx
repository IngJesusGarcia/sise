import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import empleadosService from '../../../services/empleadosService';
import { Card, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { FormGroup, Label, Input, Select } from '../../../components/ui/Form';

const EmpleadoForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [departamentos, setDepartamentos] = useState([]);
  const [puestos, setPuestos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    departamento_id: '', puesto_id: '', numero_empleado: '',
    nombre: '', apellido_paterno: '', apellido_materno: '',
    rfc: '', curp: '', correo: '', telefono: '',
    fecha_ingreso: '', tipo_contrato: 'base', estatus: 'activo',
    salario_base: '',
  });

  useEffect(() => {
    empleadosService.getDepartamentos().then(setDepartamentos);
    if (isEditing) {
      empleadosService.getById(id).then(e => {
        setFormData({
          departamento_id: e.departamento_id, puesto_id: e.puesto_id,
          numero_empleado: e.numero_empleado ?? '', nombre: e.nombre,
          apellido_paterno: e.apellido_paterno, apellido_materno: e.apellido_materno ?? '',
          rfc: e.rfc ?? '', curp: e.curp ?? '',
          correo: e.correo ?? '', telefono: e.telefono ?? '',
          fecha_ingreso: e.fecha_ingreso ?? '', tipo_contrato: e.tipo_contrato,
          estatus: e.estatus, salario_base: e.contrato_activo?.salario ?? '',
        });
        empleadosService.getPuestos({ departamento_id: e.departamento_id }).then(setPuestos);
      });
    }
  }, [id]);

  const handleChange = e => setFormData({ ...formData, [e.target.id]: e.target.value });

  const handleDptoChange = async e => {
    const dptoId = e.target.value;
    setFormData({ ...formData, departamento_id: dptoId, puesto_id: '' });
    if (dptoId) {
      const p = await empleadosService.getPuestos({ departamento_id: dptoId });
      setPuestos(p);
    } else setPuestos([]);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) await empleadosService.update(id, formData);
      else await empleadosService.create(formData);
      navigate('/rrhh/empleados');
    } catch (err) {
      alert(err.response?.data?.message ?? 'Error al guardar empleado.');
    } finally { setLoading(false); }
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <button onClick={() => navigate('/rrhh/empleados')} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors text-gray-500">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{isEditing ? 'Editar Empleado' : 'Registrar Nuevo Empleado'}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="p-8 space-y-8">
            {/* Datos Personales */}
            <section>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5 pb-2 border-b border-gray-100">Datos Personales</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <FormGroup>
                  <Label htmlFor="nombre">Nombre(s)</Label>
                  <Input id="nombre" value={formData.nombre} onChange={handleChange} required />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="apellido_paterno">Apellido Paterno</Label>
                  <Input id="apellido_paterno" value={formData.apellido_paterno} onChange={handleChange} required />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="apellido_materno">Apellido Materno</Label>
                  <Input id="apellido_materno" value={formData.apellido_materno} onChange={handleChange} />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="rfc">RFC</Label>
                  <Input id="rfc" value={formData.rfc} onChange={handleChange} maxLength={13}
                    className="font-mono uppercase tracking-widest" placeholder="13 caracteres" />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="curp">CURP</Label>
                  <Input id="curp" value={formData.curp} onChange={handleChange} maxLength={18}
                    className="font-mono uppercase tracking-widest" placeholder="18 caracteres" />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="correo">Correo Electrónico</Label>
                  <Input id="correo" type="email" value={formData.correo} onChange={handleChange} />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input id="telefono" type="tel" value={formData.telefono} onChange={handleChange} maxLength={15} />
                </FormGroup>
              </div>
            </section>

            {/* Datos Laborales */}
            <section>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5 pb-2 border-b border-gray-100">Datos Laborales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormGroup>
                  <Label htmlFor="numero_empleado">Número de Empleado</Label>
                  <Input id="numero_empleado" value={formData.numero_empleado} onChange={handleChange} required
                    className="font-mono font-bold" placeholder="Ej. EMP-001" />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="fecha_ingreso">Fecha de Ingreso</Label>
                  <Input id="fecha_ingreso" type="date" value={formData.fecha_ingreso} onChange={handleChange} required />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="departamento_id">Departamento</Label>
                  <Select id="departamento_id" value={formData.departamento_id} onChange={handleDptoChange} required>
                    <option value="">Seleccionar departamento...</option>
                    {departamentos.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                  </Select>
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="puesto_id">Puesto</Label>
                  <Select id="puesto_id" value={formData.puesto_id} onChange={handleChange} required disabled={!puestos.length}>
                    <option value="">Seleccionar puesto...</option>
                    {puestos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </Select>
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="tipo_contrato">Tipo de Contrato</Label>
                  <Select id="tipo_contrato" value={formData.tipo_contrato} onChange={handleChange}>
                    <option value="base">Base</option>
                    <option value="confianza">Confianza</option>
                    <option value="honorarios">Honorarios</option>
                    <option value="temporal">Temporal</option>
                  </Select>
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="salario_base">Salario Base (MXN)</Label>
                  <Input id="salario_base" type="number" step="0.01" min="0" value={formData.salario_base} onChange={handleChange}
                    className="font-mono" placeholder="Ej. 18000.00" />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="estatus">Estatus</Label>
                  <Select id="estatus" value={formData.estatus} onChange={handleChange}>
                    <option value="activo">Activo</option>
                    <option value="baja">Baja</option>
                    <option value="licencia">Licencia</option>
                    <option value="jubilado">Jubilado</option>
                  </Select>
                </FormGroup>
              </div>
            </section>
          </CardContent>
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => navigate('/rrhh/empleados')}>Cancelar</Button>
            <Button variant="primary" type="submit" isLoading={loading} icon={Save}>
              {isEditing ? 'Guardar Cambios' : 'Registrar Empleado'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default EmpleadoForm;
