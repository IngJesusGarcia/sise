<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExpedienteJuridico extends Model
{
    use HasFactory;

    protected $table = 'expedientes_juridicos';

    protected $fillable = [
        'numero_expediente',
        'categoria',
        'juzgado',
        'abogado_id',
        'fecha_inicio',
        'estatus',
        'observaciones',
    ];

    protected $casts = [
        'fecha_inicio' => 'date',
    ];

    public function abogado()
    {
        return $this->belongsTo(Abogado::class);
    }
}
