<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DevolucionPrestamo extends Model
{
    use HasFactory;

    protected $table = 'devoluciones_prestamo';

    protected $fillable = [
        'prestamo_id',
        'fecha_devolucion_real',
        'estado_equipo',
        'observaciones',
    ];

    protected $casts = [
        'fecha_devolucion_real' => 'datetime',
    ];

    public function prestamo()
    {
        return $this->belongsTo(SolicitudPrestamo::class, 'prestamo_id');
    }
}
