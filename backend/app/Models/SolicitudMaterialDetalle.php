<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class SolicitudMaterialDetalle extends Model {
    protected $table = 'solicitud_material_detalle';
    protected $fillable = ['solicitud_id','material_id','cantidad_solicitada','cantidad_entregada'];
    public function solicitud() { return $this->belongsTo(SolicitudMaterial::class); }
    public function material()  { return $this->belongsTo(Material::class); }
}
