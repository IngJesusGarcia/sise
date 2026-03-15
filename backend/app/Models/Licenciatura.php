<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Licenciatura extends Model
{
    use HasFactory;
    protected $fillable = ['nombre', 'clave', 'modalidad', 'duracion_semestres', 'activa', 'descripcion'];
}
