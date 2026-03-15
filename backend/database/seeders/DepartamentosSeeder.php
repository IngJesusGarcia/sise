<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DepartamentosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $departamentos = [
            ['nombre' => 'Rectoría', 'clave' => 'RECT', 'activo' => true],
            ['nombre' => 'Secretaría Ejecutiva', 'clave' => 'SECEXE', 'activo' => true],
            ['nombre' => 'Secretaría Administrativa', 'clave' => 'SECADM', 'activo' => true],
            ['nombre' => 'Servicios Escolares', 'clave' => 'SESCO', 'activo' => true],
            ['nombre' => 'Recursos Humanos', 'clave' => 'RRHH', 'activo' => true],
            ['nombre' => 'Recursos Materiales', 'clave' => 'RMAT', 'activo' => true],
            ['nombre' => 'Recursos Financieros', 'clave' => 'RFIN', 'activo' => true],
            ['nombre' => 'Oficialía de Partes', 'clave' => 'OFPART', 'activo' => true],
            ['nombre' => 'Dirección Académica', 'clave' => 'DIRAC', 'activo' => true],
            ['nombre' => 'Área Jurídica', 'clave' => 'JUR', 'activo' => true],
            ['nombre' => 'Vinculación y Extensión', 'clave' => 'VINC', 'activo' => true],
            ['nombre' => 'Sistemas y Telecomunicaciones', 'clave' => 'SIST', 'activo' => true],
        ];

        // Solo insertarlos si no existen
        foreach ($departamentos as $depto) {
            DB::table('departamentos')->updateOrInsert(
                ['clave' => $depto['clave']],
                ['nombre' => $depto['nombre'], 'activo' => $depto['activo']]
            );
        }
    }
}
