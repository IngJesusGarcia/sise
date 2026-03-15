import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, CheckCircle, FileBadge } from 'lucide-react';
import certificadosService from '../../services/certificadosService';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { FormGroup, Label, Select } from '../../components/ui/Form';

const CertificadoForm = () => {
  const navigate = useNavigate();

  const [estudiantes, setEstudiantes] = useState([]);
  const [formData, setFormData] = useState({
    alumno_id: '',
    tipo: 'constancia_estudios'
  });
  
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // Status for success state
  const [successDoc, setSuccessDoc] = useState(null);

  useEffect(() => {
    loadEstudiantes();
  }, []);

  const loadEstudiantes = async () => {
    try {
      const data = await certificadosService.getEstudiantes();
      setEstudiantes(data);
    } catch (error) {
      console.error('Error fetching catalog', error);
      alert('Error de conexión.');
    } finally {
      setPageLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.alumno_id) {
      alert('Seleccione un alumno.');
      return;
    }

    setLoading(true);
    
    try {
      const resp = await certificadosService.create(formData);
      setSuccessDoc(resp);
    } catch (error) {
      alert(error.response?.data?.error || 'Error al generar documento.');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex justify-center flex-col items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-unich-purple border-t-transparent mb-4"></div>
      </div>
    );
  }

  if (successDoc) {
     return (
        <div className="animate-fade-in max-w-3xl mx-auto mt-12 text-center">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={48} />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">¡Documento Generado!</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
               El archivo se ha expedido correctamente bajo el número de folio interno y consecutivo de seguridad.
            </p>
            
            <Card className="mb-8 border-dashed bg-gray-50/50">
               <CardContent className="p-8">
                  <span className="block text-xs uppercase font-bold text-gray-400 tracking-widest mb-1">Folio del Documento</span>
                  <span className="block text-3xl font-mono font-bold text-unich-purple mb-6">{successDoc.folio}</span>
                  
                  <div className="grid grid-cols-2 gap-4 text-left border-t border-gray-200 pt-6">
                     <div>
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estudiante</span>
                        <span className="block font-semibold text-gray-800">{successDoc.alumno?.nombre} {successDoc.alumno?.apellido_paterno}</span>
                     </div>
                     <div>
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tipo</span>
                        <span className="block font-semibold text-gray-800 capitalize">{String(successDoc.tipo).replace('_', ' ')}</span>
                     </div>
                  </div>
               </CardContent>
            </Card>

            <div className="flex justify-center gap-4">
               <Button variant="outline" onClick={() => navigate('/certificados')}>
                 Ir a Folios
               </Button>
               <Button variant="primary" icon={FileBadge} onClick={() => {
                 setFormData({ alumno_id: '', tipo: 'constancia_estudios' });
                 setSuccessDoc(null);
               }}>
                 Generar Otro
               </Button>
            </div>
        </div>
     );
  }

  return (
    <div className="animate-fade-in max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <button 
          onClick={() => navigate('/certificados')}
          className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 text-gray-500 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Emisión de Nuevo Documento</h1>
          <p className="text-gray-500 text-sm">
            Selecciona al alumno y el tipo de documento a expedir (Se generará un folio de seguridad).
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="p-8 space-y-6">
            
            <FormGroup>
                <Label htmlFor="alumno_id">Buscar Estudiante</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="text-gray-400" size={18} />
                  </div>
                  <Select 
                    id="alumno_id"
                    value={formData.alumno_id}
                    onChange={(e) => setFormData({...formData, alumno_id: e.target.value})}
                    className="pl-10"
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

            <FormGroup>
                <Label htmlFor="tipo">Trámite Académico a Expedir</Label>
                <Select 
                  id="tipo"
                  value={formData.tipo}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                  className="bg-unich-purple/5 border-unich-purple/20 text-unich-purple font-semibold"
                >
                  <option value="constancia_estudios">Constancia de Estudios (Vigencia Anual)</option>
                  <option value="carta_pasante">Carta de Pasante (Documento Egreso)</option>
                  <option value="certificado">Certificado Parcial/Total de Estudios</option>
                  <option value="duplicado_certificado">Duplicado de Certificado</option>
                </Select>
            </FormGroup>
            
          </CardContent>
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-end">
             <Button variant="primary" type="submit" isLoading={loading} icon={FileBadge}>
               Generar Folio y Documento
             </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default CertificadoForm;
