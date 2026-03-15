<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Modalidades de titulación
        Schema::create('modalidades_titulacion', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100);
            $table->text('descripcion')->nullable();
            $table->boolean('activa')->default(true);
            $table->timestamps();
        });

        // Egresados
        Schema::create('egresados', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alumno_id')->constrained()->onDelete('cascade');
            $table->foreignId('periodo_id')->constrained()->onDelete('cascade'); // periodo de egreso
            $table->date('fecha_egreso');
            $table->decimal('promedio_egreso', 5, 2)->nullable();
            $table->unsignedSmallInteger('creditos_totales')->nullable();
            $table->enum('estatus_titulacion', ['sin_iniciar', 'en_proceso', 'titulado'])->default('sin_iniciar');
            $table->timestamps();

            $table->unique('alumno_id');
            $table->index(['periodo_id', 'estatus_titulacion']);
        });

        // Actas de examen profesional
        Schema::create('actas_examen', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alumno_id')->constrained()->onDelete('cascade');
            $table->foreignId('modalidad_titulacion_id')->constrained('modalidades_titulacion')->onDelete('cascade');
            $table->string('numero_acta', 30)->unique();
            $table->date('fecha_examen');
            $table->enum('resultado', ['aprobado', 'reprobado', 'Mención Honorífica'])->default('aprobado');
            $table->string('sinodal1', 150)->nullable();
            $table->string('sinodal2', 150)->nullable();
            $table->string('sinodal3', 150)->nullable();
            $table->string('presidente', 150)->nullable();
            $table->string('secretario', 150)->nullable();
            $table->string('titulo_trabajo', 300)->nullable();
            $table->foreignId('registrado_por')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('alumno_id');
        });

        // Registro de titulados
        Schema::create('titulados', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alumno_id')->constrained()->onDelete('cascade');
            $table->foreignId('acta_examen_id')->constrained('actas_examen')->onDelete('cascade');
            $table->string('numero_titulo', 30)->unique()->nullable();
            $table->date('fecha_titulo');
            $table->string('cedula_profesional', 20)->unique()->nullable();
            $table->timestamps();

            $table->unique('alumno_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('titulados');
        Schema::dropIfExists('actas_examen');
        Schema::dropIfExists('egresados');
        Schema::dropIfExists('modalidades_titulacion');
    }
};
