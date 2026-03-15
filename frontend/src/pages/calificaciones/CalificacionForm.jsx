import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, CheckCircle } from 'lucide-react';
import calificacionesService from '../../services/calificacionesService';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

// Helper to determine color for grade
const gradeColor = (val) => {
  if (val === null || val === undefined || val === '') return 'bg-gray-50 text-gray-700';
  const n = Number(val);
  if (n >= 8) return 'bg-green-50 text-green-800 border-green-200';
  if (n >= 6) return 'bg-blue-50 text-blue-800 border-blue-200';
  return 'bg-red-50 text-red-700 border-red-200';
};

const GradeInput = ({ value, onChange, disabled }) => (
  <input
    type="number"
    min="0"
    max="10"
    step="0.1"
    value={value ?? ''}
    onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
    disabled={disabled}
    className={`w-20 text-center font-mono text-sm border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-unich-purple/40 transition-colors ${gradeColor(value)}`}
    placeholder="—"
  />
);

const CalificacionForm = () => {
  const { grupoId } = useParams();
  const navigate = useNavigate();

  const [grupo, setGrupo] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedRows, setSavedRows] = useState({});

  useEffect(() => {
    loadData();
  }, [grupoId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await calificacionesService.getAlumnosPorGrupo(grupoId);
      setGrupo(data.grupo);
      setAlumnos(data.alumnos.map(a => ({
        ...a,
        // Editable local state
        p1: a.calificacion_parcial1,
        p2: a.calificacion_parcial2,
        p3: a.calificacion_parcial3,
        final: a.calificacion_final,
        ext: a.calificacion_extraordinario,
        dirty: false,
      })));
    } catch (err) {
      console.error('Error loading alumnos:', err);
      alert('Error al cargar el grupo.');
      navigate('/calificaciones');
    } finally {
      setLoading(false);
    }
  };

  const updateAlumno = (index, field, value) => {
    setAlumnos(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value, dirty: true };

      // Auto-calculate final from parciales
      const a = updated[index];
      const vals = [a.p1, a.p2, a.p3].filter(v => v !== null && v !== undefined && v !== '');
      if (vals.length > 0) {
        updated[index].final = parseFloat((vals.reduce((s, v) => s + Number(v), 0) / vals.length).toFixed(2));
      }
      return updated;
    });
  };

  const saveAlumno = async (alumno, index) => {
    try {
      await calificacionesService.save({
        alumno_id: alumno.alumno_id,
        grupo_id: grupoId,
        calificacion_parcial1: alumno.p1,
        calificacion_parcial2: alumno.p2,
        calificacion_parcial3: alumno.p3,
        calificacion_final: alumno.final,
        calificacion_extraordinario: alumno.ext,
      });

      setSavedRows(prev => ({ ...prev, [index]: true }));
      setAlumnos(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], dirty: false };
        return updated;
      });
      setTimeout(() => setSavedRows(prev => ({ ...prev, [index]: false })), 2000);
    } catch (err) {
      alert(err.response?.data?.error || 'Error al guardar calificación.');
    }
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      const dirtyAlumnos = alumnos.map((a, i) => ({ alumno: a, index: i })).filter(({ alumno }) => alumno.dirty);
      for (const { alumno, index } of dirtyAlumnos) {
        await saveAlumno(alumno, index);
      }
      alert(`✅ Se guardaron ${dirtyAlumnos.length} calificaciones correctamente.`);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-unich-purple border-t-transparent"></div>
      </div>
    );
  }

  const estatusBadge = (final) => {
    if (final === null || final === undefined || final === '') return null;
    const n = Number(final);
    if (n >= 6) return <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full font-bold">APROBADO</span>;
    return <span className="text-xs px-2 py-0.5 bg-red-100 text-red-800 rounded-full font-bold">REPROBADO</span>;
  };

  const dirtyCount = alumnos.filter(a => a.dirty).length;

  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => navigate('/calificaciones')}
          className="mt-1 p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 text-gray-500 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Captura de Calificaciones</h1>
          {grupo && (
            <p className="text-gray-500 text-sm mt-1">
              Grupo <strong className="text-unich-purple">{grupo.clave_grupo}</strong> · {grupo.materia?.nombre} · {alumnos.length} alumnos inscritos
            </p>
          )}
        </div>
        <div className="flex gap-3 items-center">
          {dirtyCount > 0 && (
            <span className="text-xs bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full font-semibold">
              {dirtyCount} sin guardar
            </span>
          )}
          <Button variant="primary" icon={Save} onClick={saveAll} isLoading={saving}>
            Guardar Todo
          </Button>
        </div>
      </div>

      {/* Tabla de captura */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-0">Matrícula</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[200px]">Estudiante</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Parcial 1</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Parcial 2</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Parcial 3</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-unich-purple uppercase tracking-wider bg-unich-purple/5">Final (Auto)</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ext.</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estatus</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {alumnos.map((alumno, i) => (
                <tr
                  key={alumno.alumno_id}
                  className={`transition-colors ${alumno.dirty ? 'bg-amber-50' : 'hover:bg-gray-50'}`}
                >
                  <td className="px-4 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">{alumno.matricula}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-gray-800 text-sm">{alumno.alumno_nombre_completo}</span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <GradeInput value={alumno.p1} onChange={(v) => updateAlumno(i, 'p1', v)} />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <GradeInput value={alumno.p2} onChange={(v) => updateAlumno(i, 'p2', v)} />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <GradeInput value={alumno.p3} onChange={(v) => updateAlumno(i, 'p3', v)} />
                  </td>
                  <td className="px-3 py-2 text-center bg-unich-purple/5">
                    <span className={`block w-20 mx-auto text-center font-mono font-bold text-base py-1.5 px-2 rounded-lg border ${gradeColor(alumno.final)}`}>
                      {alumno.final !== null && alumno.final !== undefined ? Number(alumno.final).toFixed(1) : '—'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <GradeInput value={alumno.ext} onChange={(v) => updateAlumno(i, 'ext', v)} />
                  </td>
                  <td className="px-3 py-2 text-center">
                    {estatusBadge(alumno.final)}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {savedRows[i] ? (
                      <CheckCircle size={20} className="inline text-green-500" />
                    ) : (
                      <button
                        disabled={!alumno.dirty}
                        onClick={() => saveAlumno(alumno, i)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                          alumno.dirty
                            ? 'bg-unich-purple text-white hover:bg-unich-purple/80'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Guardar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {alumnos.length === 0 && (
            <div className="h-32 flex items-center justify-center text-gray-400 text-sm">
              No hay alumnos inscritos en este grupo.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer floating bar */}
      {dirtyCount > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="flex items-center gap-3 bg-white rounded-2xl shadow-2xl border border-gray-100 px-5 py-3">
            <span className="text-sm text-gray-600">{dirtyCount} calificación(es) pendientes de guardar</span>
            <Button variant="primary" size="sm" icon={Save} onClick={saveAll} isLoading={saving}>
              Guardar Todo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalificacionForm;
