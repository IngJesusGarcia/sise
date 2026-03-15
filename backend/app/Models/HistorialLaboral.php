<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class HistorialLaboral extends Model
{
    use HasFactory;
    protected $table = 'historial_laboral';
    protected $fillable = ['empleado_id', 'puesto_id', 'departamento_id', 'tipo_movimiento', 'fecha_movimiento', 'salario_nuevo', 'motivo'];
    protected $casts = ['fecha_movimiento' => 'date'];
    public function empleado()    { return $this->belongsTo(Empleado::class); }
    public function puesto()      { return $this->belongsTo(Puesto::class); }
    public function departamento(){ return $this->belongsTo(Departamento::class); }
}
