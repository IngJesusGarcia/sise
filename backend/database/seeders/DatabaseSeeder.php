<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Licenciatura;
use App\Models\PlanEstudio;
use App\Models\Periodo;
use App\Models\Materia;
use App\Models\Docente;
use App\Models\Alumno;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolesPermissionsSeeder::class,
            CatalogoAcademicoSeeder::class,
            UsersSeeder::class,
            EstudiantesSeeder::class,
            DepartamentosSeeder::class,
            PrestamosSeeder::class,
        ]);
    }
}
