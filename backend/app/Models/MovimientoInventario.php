<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class MovimientoInventario extends Model {
    protected $table = 'movimientos_inventario';
    protected $fillable = ['material_id','almacen_id','tipo','cantidad','cantidad_anterior','cantidad_nueva','motivo','referencia','registrado_por'];
    public function material()   { return $this->belongsTo(Material::class); }
    public function almacen()    { return $this->belongsTo(Almacen::class); }
    public function registrador(){ return $this->belongsTo(\App\Models\User::class, 'registrado_por'); }
}
