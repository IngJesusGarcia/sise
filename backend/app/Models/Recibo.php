<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Recibo extends Model
{
    use HasFactory;
    protected $table = 'recibos';
    protected $fillable = ['pago_id', 'folio', 'monto', 'fecha_emision', 'archivo', 'emitido_por'];
    protected $casts = ['fecha_emision' => 'datetime'];
    public function pago()       { return $this->belongsTo(Pago::class)->with(['alumno', 'lineaCaptura.servicio']); }
    public function emisor()     { return $this->belongsTo(\App\Models\User::class, 'emitido_por'); }
}
