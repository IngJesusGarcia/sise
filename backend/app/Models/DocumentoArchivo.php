<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class DocumentoArchivo extends Model {
    protected $table = 'documentos_archivo';
    protected $fillable = ['documento_id','nombre_archivo','ruta','tipo_mime','tamanio','subido_por'];
    public function documento()  { return $this->belongsTo(Documento::class); }
    public function subidoPor()  { return $this->belongsTo(\App\Models\User::class, 'subido_por'); }
}
