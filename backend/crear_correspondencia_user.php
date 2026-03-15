<?php
// crear_correspondencia_user.php
// Ejecutar con: php artisan create-user
// O usar un script temporal para ejecutar en artisan tinker

use App\Models\User;
use Spatie\Permission\Models\Role;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Crear rol base si no existe
$role = Role::firstOrCreate(['name' => 'correspondencia', 'guard_name' => 'web']);

// Correspondencia se suele manejar desde Secretaría Administrativa o Servicios Escolares
$user = User::updateOrCreate(
    ['email' => 'correspondencia@unich.edu.mx'],
    [
        'name' => 'Encargado de Correspondencia',
        'password' => bcrypt('Correspondencia@2024'), // en el seeder se aplica Hash
        'area' => 'Oficialía de Partes',
    ]
);

// SYNC ROLES instead of assign, so it removes any other roles (like servicios_escolares)
$user->syncRoles([$role]);

echo "Usuario de correspondencia creado y roles sincronizados:\n";
echo "Email: correspondencia@unich.edu.mx\n";
echo "Password: Correspondencia@2024\n";
echo "Roles actuales: " . implode(', ', $user->getRoleNames()->toArray()) . "\n";
