<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SolicitudPrestamo extends Model
{
    use HasFactory;

    protected $table = 'solicitudes_prestamo';

    protected $fillable = [
        'usuario_id',
        'equipo_id',
        'fecha_solicitud',
        'fecha_prestamo',
        'fecha_devolucion',
        'motivo',
        'estatus',
    ];

    protected $casts = [
        'fecha_solicitud' => 'datetime',
        'fecha_prestamo' => 'date',
        'fecha_devolucion' => 'date',
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function equipo()
    {
        return $this->belongsTo(EquipoPrestamo::class, 'equipo_id');
    }

    public function devolucion()
    {
        return $this->hasOne(DevolucionPrestamo::class, 'prestamo_id');
    }
}
