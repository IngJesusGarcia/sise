<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::dropIfExists('correspondencia_juridica');
        Schema::dropIfExists('convenios_contratos');
        Schema::dropIfExists('demandas_laborales');
        Schema::dropIfExists('expedientes_juridicos');
        Schema::dropIfExists('abogados');

        // 1. Abogados
        Schema::create('abogados', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 150);
            $table->string('telefono', 20)->nullable();
            $table->string('correo', 100)->nullable();
            $table->string('especialidad', 150)->nullable();
            $table->boolean('estatus')->default(true);
            $table->timestamps();
        });

        // 2. Expedientes Jurídicos
        Schema::create('expedientes_juridicos', function (Blueprint $table) {
            $table->id();
            $table->string('numero_expediente', 50)->unique();
            $table->string('categoria', 100);
            $table->string('juzgado', 150)->nullable();
            $table->foreignId('abogado_id')->nullable()->constrained('abogados')->nullOnDelete();
            $table->date('fecha_inicio')->nullable();
            $table->enum('estatus', ['activo', 'concluido', 'suspendido', 'archivado'])->default('activo');
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });

        // 3. Demandas Laborales
        Schema::create('demandas_laborales', function (Blueprint $table) {
            $table->id();
            $table->string('numero_progresivo', 50)->unique();
            $table->date('fecha_demanda')->nullable();
            $table->string('nombre_trabajador', 150);
            $table->string('numero_expediente', 50)->nullable(); // No FK because it might not be in our system yet
            $table->text('prestacion_principal')->nullable();
            
            // Etapas procesales
            $table->date('fecha_emplazamiento')->nullable();
            $table->date('fecha_contestacion')->nullable();
            $table->text('desahogo_pruebas')->nullable();
            $table->date('fecha_laudo')->nullable();
            $table->string('resultado', 150)->nullable();
            $table->boolean('amparo')->default(false);
            $table->text('ejecucion_laudo')->nullable();
            $table->text('interlocutoria')->nullable();
            
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });

        // 4. Convenios y Contratos
        Schema::create('convenios_contratos', function (Blueprint $table) {
            $table->id();
            $table->string('numero_control', 50)->unique();
            $table->string('tipo_convenio', 100); // Marco, Específico, Prestación, etc
            $table->string('instituciones', 255);
            $table->text('descripcion')->nullable();
            $table->date('fecha_firma')->nullable();
            $table->date('fecha_vencimiento')->nullable();
            $table->string('archivo')->nullable(); // Ruta PDF
            $table->timestamps();
        });

        // 5. Correspondencia Jurídica
        Schema::create('correspondencia_juridica', function (Blueprint $table) {
            $table->id();
            $table->string('folio', 50)->unique();
            $table->string('tipo_documento', 100);
            $table->string('asunto', 255);
            $table->foreignId('abogado_id')->nullable()->constrained('abogados')->nullOnDelete();
            $table->date('fecha')->nullable();
            $table->enum('estatus', ['registrado', 'en_proceso', 'atendido', 'archivado'])->default('registrado');
            $table->string('archivo')->nullable(); // Ruta PDF
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('correspondencia_juridica');
        Schema::dropIfExists('convenios_contratos');
        Schema::dropIfExists('demandas_laborales');
        Schema::dropIfExists('expedientes_juridicos');
        Schema::dropIfExists('abogados');
    }
};
