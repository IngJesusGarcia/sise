<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ModalidadTitulacion extends Model
{
    protected $table = 'modalidades_titulacion';
    protected $fillable = ['nombre', 'descripcion', 'activa'];
    protected $casts = ['activa' => 'boolean'];
}
