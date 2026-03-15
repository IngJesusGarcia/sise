<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UsersSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name'     => 'Administrador SISE',
                'email'    => 'admin@unich.edu.mx',
                'password' => Hash::make('Admin@2024'),
                'activo'   => true,
                'role'     => 'admin',
            ],
            [
                'name'     => 'Servicios Escolares',
                'email'    => 'escolares@unich.edu.mx',
                'password' => Hash::make('Sise@2024'),
                'activo'   => true,
                'role'     => 'servicios_escolares',
            ],
            [
                'name'     => 'Dr. Docente Demo',
                'email'    => 'docente@unich.edu.mx',
                'password' => Hash::make('Docente@2024'),
                'activo'   => true,
                'role'     => 'docente',
            ],
            [
                'name'     => 'Estudiante Demo',
                'email'    => 'estudiante@unich.edu.mx',
                'password' => Hash::make('Alumno@2024'),
                'activo'   => true,
                'role'     => 'estudiante',
            ],
            [
                'name'     => 'Recursos Humanos',
                'email'    => 'rrhh@unich.edu.mx',
                'password' => Hash::make('Rrhh@2024'),
                'activo'   => true,
                'role'     => 'rrhh',
            ],
            [
                'name'     => 'Finanzas UNICH',
                'email'    => 'finanzas@unich.edu.mx',
                'password' => Hash::make('Finanzas@2024'),
                'activo'   => true,
                'role'     => 'finanzas',
            ],
            [
                'name'     => 'Área Jurídica',
                'email'    => 'juridico@unich.edu.mx',
                'password' => Hash::make('Juridico@2024'),
                'activo'   => true,
                'role'     => 'juridico',
            ],
            [
                'name'     => 'Vinculación',
                'email'    => 'vinculacion@unich.edu.mx',
                'password' => Hash::make('Vinculacion@2024'),
                'activo'   => true,
                'role'     => 'vinculacion',
            ],
        ];

        foreach ($users as $userData) {
            $role = $userData['role'];
            unset($userData['role']);

            $user = User::updateOrCreate(['email' => $userData['email']], $userData);
            $user->syncRoles([$role]);
        }
    }
}
