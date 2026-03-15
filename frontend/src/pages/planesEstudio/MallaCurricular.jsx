import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Grid3x3, Plus, Trash2, Check } from 'lucide-react';
import planesEstudioService from '../../services/planesEstudioService';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const SEMESTER_COLORS = [
  'bg-red-100 border-red-200 text-red-800',
  'bg-orange-100 border-orange-200 text-orange-800',
  'bg-amber-100 border-amber-200 text-amber-800',
  'bg-yellow-100 border-yellow-200 text-yellow-800',
  'bg-lime-100 border-lime-200 text-lime-800',
  'bg-emerald-100 border-emerald-200 text-emerald-800',
  'bg-teal-100 border-teal-200 text-teal-800',
  'bg-blue-100 border-blue-200 text-blue-800',
  'bg-indigo-100 border-indigo-200 text-indigo-800',
  'bg-purple-100 border-purple-200 text-purple-800',
];

const MallaCurricular = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [plan, setPlan] = useState(null);
  const [allMaterias, setAllMaterias] = useState([]);
  // Local state: array of { materia_id, semestre }
  const [assignments, setAssignments] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [numSemestres, setNumSemestres] = useState(8);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const [planData, materiasData] = await Promise.all([
        planesEstudioService.getById(id),
        planesEstudioService.getMaterias(),
      ]);
      setPlan(planData);
      const mats = Array.isArray(materiasData) ? materiasData : materiasData.data ?? [];
      setAllMaterias(mats);

      // Build existing assignments from plan.materias with pivot
      const existing = (planData.materias ?? []).map(m => ({
        materia_id: m.id,
        semestre: m.pivot?.semestre ?? 1,
      }));
      setAssignments(existing);

      // Try to guess number of semesters from licenciatura
      if (planData.licenciatura?.duracion_semestres) {
        setNumSemestres(planData.licenciatura.duracion_semestres);
      }
    };
    loadData().catch(console.error);
  }, [id]);

  const toggleMateria = (materia, semestre) => {
    const existing = assignments.find(a => a.materia_id === materia.id);
    if (existing) {
      if (existing.semestre === semestre) {
        // Remove
        setAssignments(assignments.filter(a => a.materia_id !== materia.id));
      } else {
        // Move to different semester
        setAssignments(assignments.map(a => a.materia_id === materia.id ? { ...a, semestre } : a));
      }
    } else {
      setAssignments([...assignments, { materia_id: materia.id, semestre }]);
    }
  };

  const getAssignedSemester = (materiaId) =>
    assignments.find(a => a.materia_id === materiaId)?.semestre;

  const semesterMaterias = (sem) =>
    assignments
      .filter(a => a.semestre === sem)
      .map(a => allMaterias.find(m => m.id === a.materia_id))
      .filter(Boolean);

  const filteredMaterias = allMaterias.filter(m =>
    `${m.clave} ${m.nombre}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      await planesEstudioService.syncMaterias(id, assignments);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      alert('Error al guardar la malla curricular.');
    } finally { setSaving(false); }
  };

  if (!plan) return (
    <div className="h-64 flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-unich-purple border-t-transparent" />
    </div>
  );

  const semesters = Array.from({ length: numSemestres }, (_, i) => i + 1);

  return (
    <div className="animate-fade-in max-w-[1400px] mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/planes-estudio')} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 text-gray-500 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Grid3x3 size={22} className="text-unich-purple" />
              <h1 className="text-2xl font-extrabold text-gray-900">Malla Curricular</h1>
            </div>
            <p className="text-sm text-gray-500">
              Plan <span className="font-mono font-bold text-unich-purple">{plan.clave}</span> — <span className="font-semibold">{plan.licenciatura?.nombre}</span>
              <span className="ml-2 text-gray-400">({assignments.length} materias asignadas)</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Semestres:</span>
            <select value={numSemestres} onChange={e => setNumSemestres(Number(e.target.value))}
              className="border border-gray-200 rounded-lg px-2 py-1 text-sm font-bold text-unich-purple bg-white">
              {[4,6,8,9,10,12].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <Button variant="primary" icon={saved ? Check : Save} onClick={handleSave} isLoading={saving}>
            {saved ? '¡Guardado!' : 'Guardar Malla'}
          </Button>
        </div>
      </div>

      <div className="flex gap-5">
        {/* Left panel: materia catalog */}
        <div className="w-72 shrink-0">
          <Card className="sticky top-4">
            <div className="p-3 border-b border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Catálogo de Materias</p>
              <input className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-unich-purple/20 focus:border-unich-purple"
                value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar materia..." />
            </div>
            <div className="divide-y divide-gray-50 max-h-[72vh] overflow-y-auto custom-scrollbar">
              {filteredMaterias.map(m => {
                const assignedSem = getAssignedSemester(m.id);
                return (
                  <div key={m.id} className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${assignedSem ? 'bg-violeta-50/30' : ''}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-mono font-bold text-gray-500">{m.clave}</p>
                        <p className="text-sm font-medium text-gray-800 truncate">{m.nombre}</p>
                        <p className="text-xs text-gray-400">{m.creditos} créditos</p>
                      </div>
                      {assignedSem && (
                        <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-extrabold ${SEMESTER_COLORS[(assignedSem - 1) % SEMESTER_COLORS.length]}`}>
                          S{assignedSem}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              {filteredMaterias.length === 0 && (
                <p className="p-4 text-xs text-gray-400 text-center">Sin resultados</p>
              )}
            </div>
          </Card>
        </div>

        {/* Right: Semester grid */}
        <div className="flex-1 overflow-x-auto">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(numSemestres, 4)}, minmax(200px, 1fr))` }}>
            {semesters.map(sem => {
              const colorCls = SEMESTER_COLORS[(sem - 1) % SEMESTER_COLORS.length];
              const materias = semesterMaterias(sem);
              const unassignedMaterias = filteredMaterias.filter(m => !getAssignedSemester(m.id));

              return (
                <Card key={sem} className={`border-t-4 ${colorCls.split(' ')[1]}`}>
                  <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                    <span className={`text-sm font-extrabold uppercase tracking-wider ${colorCls.split(' ')[2]}`}>
                      Semestre {sem}
                    </span>
                    <span className="text-xs text-gray-400 font-semibold">{materias.length} mat.</span>
                  </div>
                  <div className="px-3 pb-3 space-y-1.5 min-h-[120px]">
                    {materias.map(m => (
                      <div key={m.id} className={`flex items-center justify-between gap-1 px-2.5 py-1.5 rounded-lg border text-xs group ${colorCls}`}>
                        <div className="min-w-0">
                          <span className="font-semibold block truncate">{m.nombre}</span>
                          <span className="opacity-60 font-mono">{m.clave} · {m.creditos} cr.</span>
                        </div>
                        <button onClick={() => toggleMateria(m, sem)}
                          className="shrink-0 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-black/10 transition-all">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                    {/* Add button dropdown */}
                    <details className="relative">
                      <summary className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer list-none transition-colors">
                        <Plus size={14} /> Agregar materia
                      </summary>
                      <div className="absolute z-50 bg-white shadow-xl border border-gray-200 rounded-xl mt-1 w-64 max-h-56 overflow-y-auto">
                        {unassignedMaterias.length === 0
                          ? <p className="text-xs text-gray-400 p-3 text-center">Sin materias disponibles.</p>
                          : unassignedMaterias.map(m => (
                            <button key={m.id} onClick={() => toggleMateria(m, sem)}
                              className="w-full text-left px-3 py-2 hover:bg-unich-purple/5 text-xs transition-colors">
                              <span className="font-bold font-mono text-gray-500">{m.clave}</span>
                              <span className="ml-1 text-gray-800">{m.nombre}</span>
                            </button>
                          ))
                        }
                      </div>
                    </details>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MallaCurricular;
