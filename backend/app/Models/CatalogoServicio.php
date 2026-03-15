<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CatalogoServicio extends Model
{
    use HasFactory;
    protected $table = 'catalogo_servicios';
    protected $fillable = ['clave', 'nombre', 'descripcion', 'costo', 'activo'];
    protected $casts = ['activo' => 'boolean', 'costo' => 'float'];
    public function lineasCaptura() { return $this->hasMany(LineaCaptura::class); }
}
