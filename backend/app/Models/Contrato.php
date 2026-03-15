<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Contrato extends Model
{
    use HasFactory;

    protected $table = 'contratos';

    protected $fillable = [
        'empleado_id', 'numero_contrato', 'fecha_inicio', 'fecha_fin',
        'salario', 'activo', 'observaciones',
    ];

    protected $casts = [
        'fecha_inicio' => 'date',
        'fecha_fin'    => 'date',
        'activo'       => 'boolean',
        'salario'      => 'float',
    ];

    public function empleado()
    {
        return $this->belongsTo(Empleado::class);
    }
}
