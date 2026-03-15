<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Aspirante extends Model
{
    use HasFactory;

    protected $table = 'aspirantes';

    protected $fillable = [
        'folio', 'nombre', 'apellido_paterno', 'apellido_materno',
        'fecha_nacimiento', 'sexo', 'curp', 'correo', 'telefono',
        'licenciatura_id', 'estatus', 'ciclo_ingreso'
    ];

    protected $casts = [
        'fecha_nacimiento' => 'date',
    ];

    public function licenciatura()
    {
        return $this->belongsTo(Licenciatura::class);
    }
}
