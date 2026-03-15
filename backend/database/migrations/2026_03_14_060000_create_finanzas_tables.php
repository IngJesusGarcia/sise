<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Catálogo de servicios escolares
        Schema::create('catalogo_servicios', function (Blueprint $table) {
            $table->id();
            $table->string('clave', 20)->unique();
            $table->string('nombre', 150);
            $table->text('descripcion')->nullable();
            $table->decimal('costo', 10, 2);
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });

        // Líneas de captura (referencias de pago)
        Schema::create('lineas_captura', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alumno_id')->constrained('alumnos')->onDelete('cascade');
            $table->foreignId('catalogo_servicio_id')->constrained()->onDelete('cascade');
            $table->string('referencia', 50)->unique();
            $table->decimal('monto', 10, 2);
            $table->date('fecha_vencimiento');
            $table->enum('estatus', ['pendiente', 'pagado', 'vencido', 'cancelado'])->default('pendiente');
            $table->foreignId('generado_por')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['alumno_id', 'estatus']);
            $table->index('fecha_vencimiento');
        });

        // Pagos
        Schema::create('pagos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('linea_captura_id')->constrained('lineas_captura')->onDelete('cascade');
            $table->foreignId('alumno_id')->constrained()->onDelete('cascade');
            $table->decimal('monto_pagado', 10, 2);
            $table->date('fecha_pago');
            $table->string('metodo_pago', 40)->default('Ventanilla');
            $table->string('banco', 80)->nullable();
            $table->string('numero_operacion', 50)->nullable();
            $table->foreignId('registrado_por')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['alumno_id', 'fecha_pago']);
        });

        // Recibos
        Schema::create('recibos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pago_id')->constrained()->onDelete('cascade');
            $table->string('folio', 20)->unique();
            $table->decimal('monto', 10, 2);
            $table->timestamp('fecha_emision')->useCurrent();
            $table->string('archivo', 255)->nullable();
            $table->foreignId('emitido_por')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recibos');
        Schema::dropIfExists('pagos');
        Schema::dropIfExists('lineas_captura');
        Schema::dropIfExists('catalogo_servicios');
    }
};
