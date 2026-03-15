<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DemandaLaboral extends Model
{
    use HasFactory;

    protected $table = 'demandas_laborales';

    protected $fillable = [
        'numero_progresivo',
        'fecha_demanda',
        'nombre_trabajador',
        'numero_expediente',
        'prestacion_principal',
        'fecha_emplazamiento',
        'fecha_contestacion',
        'desahogo_pruebas',
        'fecha_laudo',
        'resultado',
        'amparo',
        'ejecucion_laudo',
        'interlocutoria',
        'observaciones',
    ];

    protected $casts = [
        'fecha_demanda' => 'date',
        'fecha_emplazamiento' => 'date',
        'fecha_contestacion' => 'date',
        'fecha_laudo' => 'date',
        'amparo' => 'boolean',
    ];
}
