<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ConvenioContrato extends Model
{
    use HasFactory;

    protected $table = 'convenios_contratos';

    protected $fillable = [
        'numero_control',
        'tipo_convenio',
        'instituciones',
        'descripcion',
        'fecha_firma',
        'fecha_vencimiento',
        'archivo',
    ];

    protected $casts = [
        'fecha_firma' => 'date',
        'fecha_vencimiento' => 'date',
    ];
}
