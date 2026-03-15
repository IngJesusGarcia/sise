<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Notificacion extends Model {
    protected $table = 'notificaciones';
    protected $fillable = ['user_id','titulo','mensaje','leida','url'];
    protected $casts = ['leida' => 'boolean'];
    public function user() { return $this->belongsTo(\App\Models\User::class); }
}
