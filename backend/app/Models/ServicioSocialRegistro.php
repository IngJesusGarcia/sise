<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServicioSocialRegistro extends Model
{
    protected $table = 'servicio_social_registros';

    protected $fillable = [
        'estudiante_id',
        'institucion',
        'proyecto',
        'fecha_inicio',
        'fecha_fin',
        'horas_requeridas',
        'horas_acumuladas',
        'estatus',
    ];

    protected $casts = [
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
        'horas_requeridas' => 'integer',
        'horas_acumuladas' => 'integer',
    ];

    public function estudiante()
    {
        return $this->belongsTo(Alumno::class, 'estudiante_id');
    }

    public function documentos()
    {
        return $this->hasMany(ServicioSocialDocumento::class, 'estudiante_id', 'estudiante_id');
    }
}
