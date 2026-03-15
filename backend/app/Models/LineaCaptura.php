<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class LineaCaptura extends Model
{
    use HasFactory;
    protected $table = 'lineas_captura';
    protected $fillable = ['alumno_id', 'catalogo_servicio_id', 'referencia', 'monto', 'fecha_vencimiento', 'estatus', 'generado_por'];
    protected $casts = ['fecha_vencimiento' => 'date', 'monto' => 'float'];
    public function alumno()          { return $this->belongsTo(Alumno::class); }
    public function servicio()        { return $this->belongsTo(CatalogoServicio::class, 'catalogo_servicio_id'); }
    public function pago()            { return $this->hasOne(Pago::class); }
    public function generador()       { return $this->belongsTo(\App\Models\User::class, 'generado_por'); }
}
