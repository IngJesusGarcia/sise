<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Alumno;
use App\Models\User;
use App\Models\Licenciatura;
use App\Models\PlanEstudio;

class EstudiantesSeeder extends Seeder
{
    public function run(): void
    {
        $licenciatura = Licenciatura::first();
        $plan = PlanEstudio::first();
        $user = User::where('email', 'estudiante@unich.edu.mx')->first();

        if ($licenciatura && $plan && $user) {
            Alumno::create([
                'user_id' => $user->id,
                'licenciatura_id' => $licenciatura->id,
                'plan_estudio_id' => $plan->id,
                'matricula' => '202400001',
                'nombre' => 'Estudiante',
                'apellido_paterno' => 'Demo',
                'apellido_materno' => 'UNICH',
                'fecha_nacimiento' => '2000-01-01',
                'estatus' => 'activo',
                'semestre_actual' => 1,
            ]);
        }
    }
}
