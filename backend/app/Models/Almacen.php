<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Almacen extends Model {
    protected $table = 'almacenes';
    protected $fillable = ['nombre','clave','ubicacion','responsable','activo'];
    protected $casts = ['activo' => 'boolean'];
    public function existencias() { return $this->hasMany(Existencia::class); }
    public function movimientos() { return $this->hasMany(MovimientoInventario::class); }
}
