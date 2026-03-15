<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Puesto extends Model
{
    use HasFactory;
    protected $fillable = ['departamento_id', 'nombre', 'clave', 'salario_base', 'activo'];
    protected $casts = ['activo' => 'boolean', 'salario_base' => 'float'];
    public function departamento() { return $this->belongsTo(Departamento::class); }
    public function empleados()    { return $this->hasMany(Empleado::class); }
}
