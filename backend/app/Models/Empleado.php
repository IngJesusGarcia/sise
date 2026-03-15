<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Empleado extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'empleados';

    protected $fillable = [
        'user_id', 'departamento_id', 'puesto_id', 'numero_empleado',
        'nombre', 'apellido_paterno', 'apellido_materno',
        'rfc', 'curp', 'correo', 'telefono',
        'fecha_ingreso', 'fecha_baja', 'tipo_contrato', 'estatus'
    ];

    protected $casts = [
        'fecha_ingreso' => 'date',
        'fecha_baja'    => 'date',
    ];

    public function departamento() { return $this->belongsTo(Departamento::class); }
    public function puesto()       { return $this->belongsTo(Puesto::class); }
    public function contratos()    { return $this->hasMany(Contrato::class); }
    public function historial()    { return $this->hasMany(HistorialLaboral::class)->orderByDesc('fecha_movimiento'); }
    public function nominas()      { return $this->hasMany(NominaEmpleado::class); }

    /** Contrato activo vigente */
    public function contratoActivo()
    {
        return $this->hasOne(Contrato::class)->where('activo', true)->latest();
    }
}
