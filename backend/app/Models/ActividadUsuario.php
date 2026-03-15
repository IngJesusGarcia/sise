<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActividadUsuario extends Model
{
    use HasFactory;
    
    protected $table = 'actividad_usuarios';

    protected $fillable = [
        'user_id',
        'accion',
        'modulo',
        'url',
        'ip',
        'user_agent',
        'payload',
        'status_code'
    ];

    protected $casts = [
        'payload' => 'array'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
