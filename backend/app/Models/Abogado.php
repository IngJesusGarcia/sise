<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Abogado extends Model
{
    use HasFactory;

    protected $table = 'abogados';

    protected $fillable = [
        'nombre',
        'telefono',
        'correo',
        'especialidad',
        'estatus',
    ];

    protected $casts = [
        'estatus' => 'boolean',
    ];

    public function expedientes()
    {
        return $this->hasMany(ExpedienteJuridico::class);
    }

    public function correspondencia()
    {
        return $this->hasMany(CorrespondenciaJuridica::class);
    }
}
