<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class AprobacionDocumento extends Model {
    protected $table = 'aprobaciones_documento';
    protected $fillable = ['documento_id','usuario_id','estatus','comentarios','fecha'];
    protected $casts = ['fecha' => 'datetime'];
    public function documento() { return $this->belongsTo(Documento::class); }
    public function usuario()   { return $this->belongsTo(\App\Models\User::class, 'usuario_id'); }
}
