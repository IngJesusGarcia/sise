<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Departamento extends Model
{
    use HasFactory;
    protected $fillable = ['nombre', 'clave', 'responsable', 'activo'];
    protected $casts = ['activo' => 'boolean'];
    public function puestos()   { return $this->hasMany(Puesto::class); }
    public function empleados() { return $this->hasMany(Empleado::class); }
}
