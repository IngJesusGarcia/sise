<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CorrespondenciaJuridica extends Model
{
    use HasFactory;

    protected $table = 'correspondencia_juridica';

    protected $fillable = [
        'folio',
        'tipo_documento',
        'asunto',
        'abogado_id',
        'fecha',
        'estatus',
        'archivo',
    ];

    protected $casts = [
        'fecha' => 'date',
    ];

    public function abogado()
    {
        return $this->belongsTo(Abogado::class);
    }
}
