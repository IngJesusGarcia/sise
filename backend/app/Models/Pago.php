<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Pago extends Model
{
    use HasFactory;
    protected $table = 'pagos';
    protected $fillable = ['linea_captura_id', 'alumno_id', 'monto_pagado', 'fecha_pago', 'metodo_pago', 'banco', 'numero_operacion', 'registrado_por'];
    protected $casts = ['fecha_pago' => 'date', 'monto_pagado' => 'float'];
    public function lineaCaptura()   { return $this->belongsTo(LineaCaptura::class); }
    public function alumno()         { return $this->belongsTo(Alumno::class); }
    public function recibo()         { return $this->hasOne(Recibo::class); }
    public function registrador()    { return $this->belongsTo(\App\Models\User::class, 'registrado_por'); }
}
