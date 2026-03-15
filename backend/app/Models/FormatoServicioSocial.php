<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FormatoServicioSocial extends Model
{
    protected $table = 'formatos_servicio_social';

    protected $fillable = [
        'nombre',
        'descripcion',
        'archivo_pdf',
        'fecha_subida',
        'subido_por',
        'activo',
    ];

    protected $casts = [
        'fecha_subida' => 'datetime',
        'activo' => 'boolean',
    ];

    public function subidoPor()
    {
        return $this->belongsTo(User::class, 'subido_por');
    }
}
