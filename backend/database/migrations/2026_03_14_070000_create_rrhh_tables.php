<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Departamentos
        Schema::create('departamentos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 120);
            $table->string('clave', 20)->unique();
            $table->string('responsable', 150)->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });

        // Puestos
        Schema::create('puestos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('departamento_id')->constrained()->onDelete('cascade');
            $table->string('nombre', 120);
            $table->string('clave', 20)->nullable();
            $table->decimal('salario_base', 10, 2)->default(0);
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });

        // Empleados
        Schema::create('empleados', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('departamento_id')->constrained()->onDelete('cascade');
            $table->foreignId('puesto_id')->constrained()->onDelete('cascade');
            $table->string('numero_empleado', 15)->unique();
            $table->string('nombre', 80);
            $table->string('apellido_paterno', 60);
            $table->string('apellido_materno', 60)->nullable();
            $table->string('rfc', 13)->unique()->nullable();
            $table->string('curp', 18)->unique()->nullable();
            $table->string('correo', 120)->unique()->nullable();
            $table->string('telefono', 15)->nullable();
            $table->date('fecha_ingreso');
            $table->date('fecha_baja')->nullable();
            $table->enum('tipo_contrato', ['base', 'confianza', 'honorarios', 'temporal'])->default('base');
            $table->enum('estatus', ['activo', 'baja', 'licencia', 'jubilado'])->default('activo');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['departamento_id', 'estatus']);
        });

        // Contratos
        Schema::create('contratos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empleado_id')->constrained()->onDelete('cascade');
            $table->string('numero_contrato', 30)->unique();
            $table->date('fecha_inicio');
            $table->date('fecha_fin')->nullable();
            $table->decimal('salario', 10, 2);
            $table->boolean('activo')->default(true);
            $table->text('observaciones')->nullable();
            $table->timestamps();

            $table->index('empleado_id');
        });

        // Historial laboral
        Schema::create('historial_laboral', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empleado_id')->constrained()->onDelete('cascade');
            $table->foreignId('puesto_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('departamento_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('tipo_movimiento', ['ingreso', 'cambio_puesto', 'cambio_dpto', 'aumento', 'baja', 'reingreso']);
            $table->date('fecha_movimiento');
            $table->decimal('salario_nuevo', 10, 2)->nullable();
            $table->string('motivo', 255)->nullable();
            $table->timestamps();
        });

        // Nóminas
        Schema::create('nominas', function (Blueprint $table) {
            $table->id();
            $table->string('periodo', 30);         // Ej: "Quincenal 1 - Enero 2024"
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->date('fecha_pago');
            $table->enum('tipo', ['quincenal', 'mensual', 'semanal'])->default('quincenal');
            $table->decimal('total_percepciones', 12, 2)->default(0);
            $table->decimal('total_deducciones', 12, 2)->default(0);
            $table->decimal('total_neto', 12, 2)->default(0);
            $table->enum('estatus', ['borrador', 'aprobada', 'pagada'])->default('borrador');
            $table->foreignId('generado_por')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // Detalle de nómina por empleado
        Schema::create('nomina_empleado', function (Blueprint $table) {
            $table->id();
            $table->foreignId('nomina_id')->constrained()->onDelete('cascade');
            $table->foreignId('empleado_id')->constrained()->onDelete('cascade');
            $table->decimal('salario_base', 10, 2);
            $table->decimal('percepciones', 10, 2)->default(0);
            $table->decimal('deducciones', 10, 2)->default(0);
            $table->decimal('neto', 10, 2)->default(0);
            $table->json('detalle')->nullable(); // desglose de conceptos
            $table->timestamps();

            $table->unique(['nomina_id', 'empleado_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('nomina_empleado');
        Schema::dropIfExists('nominas');
        Schema::dropIfExists('historial_laboral');
        Schema::dropIfExists('contratos');
        Schema::dropIfExists('empleados');
        Schema::dropIfExists('puestos');
        Schema::dropIfExists('departamentos');
    }
};
