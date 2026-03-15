<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Licenciatura;
use App\Models\PlanEstudio;
use App\Models\Periodo;

class CatalogoAcademicoSeeder extends Seeder
{
    public function run(): void
    {
        $licenciatura = Licenciatura::create([
            'clave' => 'LDS',
            'nombre' => 'Licenciatura en Desarrollo de Software',
            'duracion_semestres' => 8,
            'modalidad' => 'Escolarizada',
            'activa' => true
        ]);

        PlanEstudio::create([
            'licenciatura_id' => $licenciatura->id,
            'clave' => 'LDS-2024',
            'anio_inicio' => 2024,
            'vigente' => true
        ]);

        Periodo::create([
            'nombre' => 'Enero - Junio 2024',
            'fecha_inicio' => '2024-01-15',
            'fecha_fin' => '2024-06-15',
            'activo' => true
        ]);
    }
}
