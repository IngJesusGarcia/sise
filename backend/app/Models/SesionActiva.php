<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SesionActiva extends Model
{
    use HasFactory;
    
    protected $table = 'sesiones_activas';

    protected $fillable = [
        'user_id', 
        'token_id', 
        'ip', 
        'user_agent', 
        'ultima_actividad'
    ];

    protected $casts = [
        'ultima_actividad' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
