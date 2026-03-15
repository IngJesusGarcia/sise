<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\EquipoPrestamo;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;

class PrestamosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Crear Rol
        $role = Role::firstOrCreate(['name' => 'prestamos']);

        // 2. Crear Usuario Encargado
        $user = User::firstOrCreate(
            ['email' => 'prestamos@unich.edu.mx'],
            [
                'name' => 'Encargado de Préstamos',
                'password' => Hash::make('Prestamos@2024'),
                'activo' => true,
            ]
        );
        $user->assignRole($role);

        // 3. Insertar Equipos de Prueba
        $equipos = [
            [
                'codigo_inventario' => 'INV-COMP-001',
                'nombre_equipo' => 'Laptop Dell Latitude',
                'categoria' => 'Cómputo',
                'descripcion' => 'Procesador i7, 16GB RAM, SSD 512GB',
                'estado' => 'disponible',
                'ubicacion' => 'Laboratorio de Cómputo A',
                'fecha_registro' => now(),
            ],
            [
                'codigo_inventario' => 'INV-PROY-001',
                'nombre_equipo' => 'Proyector Epson PowerLite',
                'categoria' => 'Audiovisual',
                'descripcion' => '3600 lúmenes, HDMI/VGA',
                'estado' => 'disponible',
                'ubicacion' => 'Almacén Central',
                'fecha_registro' => now(),
            ],
            [
                'codigo_inventario' => 'INV-CAM-001',
                'nombre_equipo' => 'Cámara Canon EOS R6',
                'categoria' => 'Audiovisual',
                'descripcion' => 'Mirrorless con lente 24-105mm',
                'estado' => 'disponible',
                'ubicacion' => 'Almacén Central',
                'fecha_registro' => now(),
            ],
            [
                'codigo_inventario' => 'INV-AUD-001',
                'nombre_equipo' => 'Bocina JBL PartyBox',
                'categoria' => 'Audiovisual',
                'descripcion' => 'Bocina portátil bluetooth',
                'estado' => 'mantenimiento',
                'ubicacion' => 'Taller de Mantenimiento',
                'fecha_registro' => now(),
            ],
        ];

        foreach ($equipos as $equipo) {
            EquipoPrestamo::firstOrCreate(
                ['codigo_inventario' => $equipo['codigo_inventario']],
                $equipo
            );
        }
    }
}
