<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Existencia extends Model {
    protected $table = 'existencias';
    protected $fillable = ['material_id','almacen_id','cantidad'];
    public function material() { return $this->belongsTo(Material::class); }
    public function almacen()  { return $this->belongsTo(Almacen::class); }
}
