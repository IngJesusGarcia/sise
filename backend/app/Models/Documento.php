<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Documento extends Model {
    use SoftDeletes;
    protected $table = 'documentos';
    protected $fillable = [
        'folio','tipo_documento_id','asunto','descripcion',
        'area_origen','area_destino','responsable','fecha',
        'estatus','archivo','creado_por',
    ];
    protected $casts = ['fecha' => 'date'];

    public function tipo()       { return $this->belongsTo(TipoDocumento::class, 'tipo_documento_id'); }
    public function creadoPor()  { return $this->belongsTo(\App\Models\User::class, 'creado_por'); }
    public function aprobaciones(){ return $this->hasMany(AprobacionDocumento::class); }
    public function archivos()   { return $this->hasMany(DocumentoArchivo::class); }
}
