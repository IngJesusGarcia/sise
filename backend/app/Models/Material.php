<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Material extends Model {
    use HasFactory, SoftDeletes;
    protected $table = 'materiales';
    protected $fillable = ['codigo','nombre','descripcion','unidad_medida','categoria','marca','precio_unitario','stock_minimo','activo'];
    protected $casts = ['activo' => 'boolean', 'precio_unitario' => 'float'];
    public function existencias() { return $this->hasMany(Existencia::class); }
    public function movimientos() { return $this->hasMany(MovimientoInventario::class); }
    // Total stock across all almacenes
    public function getStockTotalAttribute() { return $this->existencias->sum('cantidad'); }
}
