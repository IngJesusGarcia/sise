<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Nomina extends Model
{
    use HasFactory;
    protected $fillable = ['periodo', 'fecha_inicio', 'fecha_fin', 'fecha_pago', 'tipo', 'total_percepciones', 'total_deducciones', 'total_neto', 'estatus', 'generado_por'];
    protected $casts = ['fecha_inicio' => 'date', 'fecha_fin' => 'date', 'fecha_pago' => 'date'];
    public function detalles()    { return $this->hasMany(NominaEmpleado::class); }
}

class NominaEmpleado extends Model
{
    use HasFactory;
    protected $table = 'nomina_empleado';
    protected $fillable = ['nomina_id', 'empleado_id', 'salario_base', 'percepciones', 'deducciones', 'neto', 'detalle'];
    protected $casts = ['detalle' => 'array'];
    public function empleado() { return $this->belongsTo(Empleado::class); }
    public function nomina()   { return $this->belongsTo(Nomina::class); }
}
