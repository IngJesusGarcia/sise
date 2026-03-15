<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class DocumentoAcademico extends Model
{
    use HasFactory;

    protected $table = 'documentos_academicos';

    protected $fillable = [
        'alumno_id', 'tipo', 'folio', 'archivo',
        'generado_por', 'fecha_generacion', 'vigente'
    ];

    protected $casts = [
        'fecha_generacion' => 'datetime',
        'vigente' => 'boolean',
    ];

    public function alumno()
    {
        return $this->belongsTo(Alumno::class);
    }

    public function generador()
    {
        return $this->belongsTo(User::class, 'generado_por');
    }
}
