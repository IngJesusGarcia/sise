<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServicioSocialDocumento extends Model
{
    protected $table = 'servicio_social_documentos';

    protected $fillable = [
        'estudiante_id',
        'tipo_documento',
        'archivo',
        'fecha_subida',
        'estatus',
    ];

    protected $casts = [
        'fecha_subida' => 'datetime',
    ];

    public function estudiante()
    {
        return $this->belongsTo(Alumno::class, 'estudiante_id');
    }
}
