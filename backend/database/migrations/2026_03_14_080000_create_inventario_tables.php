<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Almacenes físicos
        Schema::create('almacenes', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 120);
            $table->string('clave', 20)->unique();
            $table->string('ubicacion', 200)->nullable();
            $table->string('responsable', 150)->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });

        // Catálogo de materiales
        Schema::create('materiales', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 30)->unique();
            $table->string('nombre', 150);
            $table->string('descripcion', 300)->nullable();
            $table->string('unidad_medida', 30)->default('Pieza');
            $table->string('categoria', 60)->nullable();
            $table->string('marca', 60)->nullable();
            $table->decimal('precio_unitario', 10, 2)->default(0);
            $table->unsignedSmallInteger('stock_minimo')->default(0);
            $table->boolean('activo')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('categoria');
        });

        // Existencias por almacén
     Schema::create('existencias', function (Blueprint $table) {
    $table->id();

    $table->foreignId('material_id')
          ->constrained('materiales')
          ->cascadeOnDelete();

    $table->foreignId('almacen_id')
          ->constrained('almacenes')
          ->cascadeOnDelete();

    $table->integer('cantidad')->default(0);
    $table->timestamps();

    $table->unique(['material_id', 'almacen_id']);
});
        // Movimientos de inventario
        Schema::create('movimientos_inventario', function (Blueprint $table) {
            $table->id();
            $table->foreignId('material_id')->constrained('materiales')->onDelete('cascade');
            $table->foreignId('almacen_id')->constrained('almacenes')->onDelete('cascade');
            $table->enum('tipo', ['entrada', 'salida', 'transferencia', 'ajuste']);
            $table->integer('cantidad');
            $table->integer('cantidad_anterior')->nullable();
            $table->integer('cantidad_nueva')->nullable();
            $table->string('motivo', 255)->nullable();
            $table->string('referencia', 50)->nullable();
            $table->foreignId('registrado_por')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['material_id', 'tipo', 'created_at']);
        });

        // Solicitudes de materiales
        Schema::create('solicitudes_materiales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('solicitante_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('almacen_id')->constrained('almacenes')->onDelete('cascade');
            $table->string('folio', 20)->unique();
            $table->enum('estatus', ['pendiente', 'aprobada', 'rechazada', 'entregada'])->default('pendiente');
            $table->string('motivo', 300)->nullable();
            $table->foreignId('aprobado_por')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('fecha_aprobacion')->nullable();
            $table->timestamps();

            $table->index(['solicitante_id', 'estatus']);
        });

        // Detalle de solicitudes
        Schema::create('solicitud_material_detalle', function (Blueprint $table) {
            $table->id();
            $table->foreignId('solicitud_id')->constrained('solicitudes_materiales')->onDelete('cascade');
            $table->foreignId('material_id')->constrained('materiales')->onDelete('cascade');
            $table->unsignedInteger('cantidad_solicitada');
            $table->unsignedInteger('cantidad_entregada')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('solicitud_material_detalle');
        Schema::dropIfExists('solicitudes_materiales');
        Schema::dropIfExists('movimientos_inventario');
        Schema::dropIfExists('existencias');
        Schema::dropIfExists('materiales');
        Schema::dropIfExists('almacenes');
    }
};
