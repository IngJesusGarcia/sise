import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Filter } from 'lucide-react';
import calificacionesService from '../../services/calificacionesService';
import { Card } from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import { FormGroup, Label, Select } from '../../components/ui/Form';

const CalificacionesList = () => {
  const [calificaciones, setCalificaciones] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [selectedGrupo, setSelectedGrupo] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadGrupos();
  }, []);

  useEffect(() => {
    if (selectedGrupo) {
      fetchCalificaciones(selectedGrupo);
    } else {
      setCalificaciones([]);
    }
  }, [selectedGrupo]);

  const loadGrupos = async () => {
    try {
      const data = await calificacionesService.getGrupos();
      setGrupos(data.data || data);
    } catch (err) {
      console.error('Error loading grupos:', err);
    }
  };

  const fetchCalificaciones = async (grupoId) => {
    try {
      setLoading(true);
      const data = await calificacionesService.getAll(grupoId);
      setCalificaciones(data);
    } catch (err) {
      console.error('Error loading calificaciones:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = calificaciones.filter(c =>
    String(c.matricula || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(c.alumno_nombre_completo || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const estatusColors = {
    'aprobado':   'bg-green-100 text-green-800',
    'reprobado':  'bg-red-100 text-red-800',
    'pendiente':  'bg-yellow-100 text-yellow-800',
    'no_presentado': 'bg-gray-100 text-gray-700'
  };

  const fmtCal = (v) => (v !== null && v !== undefined) ? Number(v).toFixed(1) : '—';

  const columns = [
    { header: 'Matrícula', accessor: 'matricula' },
    {
      header: 'Estudiante',
      cell: (row) => <span className="font-semibold text-gray-800">{row.alumno_nombre_completo}</span>
    },
    { header: 'P1', cell: (row) => <span className="font-mono text-center block">{fmtCal(row.calificacion_parcial1)}</span> },
    { header: 'P2', cell: (row) => <span className="font-mono text-center block">{fmtCal(row.calificacion_parcial2)}</span> },
    { header: 'P3', cell: (row) => <span className="font-mono text-center block">{fmtCal(row.calificacion_parcial3)}</span> },
    {
      header: 'Final',
      cell: (row) => (
        <span className={`font-mono font-bold text-center block text-lg ${row.calificacion_final >= 6 ? 'text-green-700' : 'text-red-600'}`}>
          {fmtCal(row.calificacion_final)}
        </span>
      )
    },
    { header: 'Ext.', cell: (row) => <span className="font-mono text-center block">{fmtCal(row.calificacion_extraordinario)}</span> },
    {
      header: 'Estatus',
      cell: (row) => (
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${estatusColors[row.estatus] || 'bg-gray-100'}`}>
          {String(row.estatus || 'pendiente').toUpperCase().replace('_', ' ')}
        </span>
      )
    }
  ];

  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-unich-purple/10 text-unich-purple rounded-lg">
              <BookOpen size={24} />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Calificaciones</h1>
          </div>
          <p className="text-gray-500">Visualiza las calificaciones por grupo. Para capturar, selecciona un grupo y haz clic en "Capturar Calificaciones".</p>
        </div>

        {selectedGrupo && (
          <Button variant="primary" icon={BookOpen} onClick={() => navigate(`/calificaciones/capturar/${selectedGrupo}`)}>
            Capturar Calificaciones
          </Button>
        )}
      </div>

      {/* Filtro de grupo */}
      <Card>
        <div className="p-4 flex items-center gap-4">
          <Filter size={18} className="text-gray-400 shrink-0" />
          <FormGroup className="mb-0 flex-1">
            <Label htmlFor="grupo_filter">Seleccionar un Grupo</Label>
            <Select
              id="grupo_filter"
              value={selectedGrupo}
              onChange={(e) => setSelectedGrupo(e.target.value)}
            >
              <option value="">— Ver todos los grupos —</option>
              {grupos.map(g => (
                <option key={g.id} value={g.id}>
                  {g.clave_grupo} — {g.materia_nombre} ({g.periodo_nombre})
                </option>
              ))}
            </Select>
          </FormGroup>
        </div>
      </Card>

      <Card>
        <div className="p-0">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-unich-purple border-t-transparent"></div>
              <p className="text-gray-500">Cargando calificaciones del grupo...</p>
            </div>
          ) : !selectedGrupo ? (
            <div className="h-48 flex flex-col items-center justify-center text-gray-400 gap-3">
              <BookOpen size={40} strokeWidth={1} />
              <p className="font-medium">Selecciona un grupo para ver sus calificaciones</p>
            </div>
          ) : (
            <Table
              columns={columns}
              data={filteredData}
              onSearch={setSearchTerm}
              searchPlaceholder="Buscar por matrícula o nombre..."
            />
          )}
        </div>
      </Card>
    </div>
  );
};

export default CalificacionesList;
