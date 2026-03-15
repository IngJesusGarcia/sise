<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class SolicitudMaterial extends Model {
    protected $table = 'solicitudes_materiales';
    protected $fillable = ['solicitante_id','almacen_id','folio','estatus','motivo','aprobado_por','fecha_aprobacion'];
    protected $casts = ['fecha_aprobacion' => 'datetime'];
    public function solicitante() { return $this->belongsTo(\App\Models\User::class, 'solicitante_id'); }
    public function aprobador()   { return $this->belongsTo(\App\Models\User::class, 'aprobado_por'); }
    public function almacen()     { return $this->belongsTo(Almacen::class); }
    public function detalles()    { return $this->hasMany(SolicitudMaterialDetalle::class, 'solicitud_id'); }
}
