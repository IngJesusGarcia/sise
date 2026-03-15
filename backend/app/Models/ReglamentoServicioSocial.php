<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReglamentoServicioSocial extends Model
{
    protected $table = 'reglamentos_servicio_social';

    protected $fillable = [
        'titulo',
        'archivo_pdf',
        'version',
        'fecha_publicacion',
        'activo',
    ];

    protected $casts = [
        'fecha_publicacion' => 'datetime',
        'activo' => 'boolean',
    ];
}
