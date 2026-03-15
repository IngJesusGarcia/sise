<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EquipoPrestamo extends Model
{
    use HasFactory;

    protected $table = 'equipos_prestamo';

    protected $fillable = [
        'codigo_inventario',
        'nombre_equipo',
        'categoria',
        'descripcion',
        'estado',
        'ubicacion',
        'fecha_registro',
    ];

    public function solicitudes()
    {
        return $this->hasMany(SolicitudPrestamo::class, 'equipo_id');
    }
}
