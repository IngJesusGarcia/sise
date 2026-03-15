<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $modulos = [
            'estudiantes', 'aspirantes', 'kardex', 'calificaciones', 'asistencias',
            'inscripciones', 'documentos', 'egresados', 'reportes',
            'finanzas', 'rrhh', 'inventario', 'correspondencia',
            'juridico', 'vinculacion', 'auditoria', 'academico', 'dashboard',
        ];

        $acciones = ['ver', 'crear', 'editar', 'eliminar'];

        // Crear permisos
        foreach ($modulos as $modulo) {
            foreach ($acciones as $accion) {
                Permission::firstOrCreate(['name' => "{$accion}_{$modulo}", 'guard_name' => 'web']);
            }
        }

        // Crear roles
        $roles = [
            'admin'             => $modulos,  // Todo
            'servicios_escolares' => ['estudiantes','aspirantes','kardex','calificaciones','asistencias','inscripciones','documentos','egresados','reportes','correspondencia','academico','dashboard'],
            'docente'           => ['kardex','calificaciones','asistencias','correspondencia','academico','dashboard'],
            'estudiante'        => ['kardex','inscripciones','documentos','reportes','vinculacion','dashboard'],
            'rrhh'              => ['rrhh','inventario','correspondencia','dashboard'],
            'finanzas'          => ['finanzas','correspondencia','dashboard'],
            'juridico'          => ['juridico','correspondencia','dashboard'],
            'vinculacion'       => ['vinculacion','correspondencia','dashboard'],
        ];

        foreach ($roles as $roleName => $modulosPermitidos) {
            $role = Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);

            $permisos = [];
            foreach ($modulosPermitidos as $modulo) {
                foreach ($acciones as $accion) {
                    $permisos[] = "{$accion}_{$modulo}";
                }
            }

            // Admin tiene todo
            if ($roleName === 'admin') {
                $role->syncPermissions(Permission::all());
            } else {
                $role->syncPermissions($permisos);
            }
        }
    }
}
