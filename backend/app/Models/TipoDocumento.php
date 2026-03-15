<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class TipoDocumento extends Model {
    protected $table = 'tipos_documento';
    protected $fillable = ['nombre','descripcion','activo'];
    protected $casts = ['activo' => 'boolean'];
    public function documentos() { return $this->hasMany(Documento::class, 'tipo_documento_id'); }
}
