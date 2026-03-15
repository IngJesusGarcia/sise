<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inscripcion extends Model
{
    use HasFactory;
    
    protected $table = 'inscripciones';

    protected $fillable = [
        'alumno_id', 'grupo_id', 'periodo_id', 'estatus', 'fecha_inscripcion'
    ];

    public function alumno() {
        return $this->belongsTo(Alumno::class);
    }

    public function grupo() {
        return $this->belongsTo(Grupo::class);
    }

    public function periodo() {
        return $this->belongsTo(Periodo::class);
    }
}
