<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Docente extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id', 'nombre', 'apellido_paterno', 'apellido_materno',
        'rfc', 'curp', 'correo', 'telefono',
        'grado_academico', 'tipo_contrato', 'activo',
    ];

    protected $casts = ['activo' => 'boolean'];

    public function user()    { return $this->belongsTo(User::class); }
    public function grupos()  { return $this->hasMany(Grupo::class); }

    public function getNombreCompletoAttribute(): string
    {
        return "{$this->grado_academico} {$this->nombre} {$this->apellido_paterno} {$this->apellido_materno}";
    }

    public function scopeActivos($q) { return $q->where('activo', true); }
}
