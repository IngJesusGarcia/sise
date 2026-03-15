<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Inscripciones (alumno a grupo)
        Schema::create('inscripciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alumno_id')->constrained()->onDelete('cascade');
            $table->foreignId('grupo_id')->constrained()->onDelete('cascade');
            $table->foreignId('periodo_id')->constrained()->onDelete('cascade');
            $table->enum('estatus', ['inscrito', 'baja', 'recursando'])->default('inscrito');
            $table->date('fecha_inscripcion');
            $table->timestamps();

            $table->unique(['alumno_id', 'grupo_id', 'periodo_id']);
            $table->index(['alumno_id', 'periodo_id']);
            $table->index(['grupo_id', 'periodo_id']);
        });

        // Calificaciones
        Schema::create('calificaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inscripcion_id')->constrained('inscripciones')->onDelete('cascade');
            $table->foreignId('alumno_id')->constrained()->onDelete('cascade');
            $table->foreignId('materia_id')->constrained()->onDelete('cascade');
            $table->foreignId('grupo_id')->constrained()->onDelete('cascade');
            $table->foreignId('periodo_id')->constrained()->onDelete('cascade');
            $table->foreignId('docente_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('calificacion_parcial1', 5, 2)->nullable();
            $table->decimal('calificacion_parcial2', 5, 2)->nullable();
            $table->decimal('calificacion_parcial3', 5, 2)->nullable();
            $table->decimal('calificacion_final', 5, 2)->nullable();
            $table->decimal('calificacion_extraordinario', 5, 2)->nullable();
            $table->enum('estatus', ['pendiente', 'aprobado', 'reprobado', 'no_presentado'])->default('pendiente');
            $table->foreignId('capturado_por')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('fecha_captura')->nullable();
            $table->timestamps();

            $table->unique(['alumno_id', 'materia_id', 'periodo_id']);
            $table->index(['alumno_id', 'periodo_id']);
            $table->index(['grupo_id', 'periodo_id']);
        });

        // Asistencias
        Schema::create('asistencias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alumno_id')->constrained()->onDelete('cascade');
            $table->foreignId('grupo_id')->constrained()->onDelete('cascade');
            $table->date('fecha');
            $table->enum('tipo', ['asistencia', 'falta', 'retardo', 'justificada'])->default('asistencia');
            $table->string('observacion', 200)->nullable();
            $table->foreignId('registrado_por')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['alumno_id', 'grupo_id', 'fecha']);
            $table->index(['grupo_id', 'fecha']);
            $table->index(['alumno_id', 'grupo_id']);
        });

        // Historial académico (por período)
        Schema::create('historial_academico', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alumno_id')->constrained()->onDelete('cascade');
            $table->foreignId('periodo_id')->constrained()->onDelete('cascade');
            $table->unsignedTinyInteger('semestre');
            $table->decimal('promedio_periodo', 5, 2)->nullable();
            $table->unsignedTinyInteger('materias_cursadas')->default(0);
            $table->unsignedTinyInteger('materias_aprobadas')->default(0);
            $table->unsignedTinyInteger('materias_reprobadas')->default(0);
            $table->enum('estatus', ['regular', 'irregular', 'baja'])->default('regular');
            $table->timestamps();

            $table->unique(['alumno_id', 'periodo_id']);
            $table->index('alumno_id');
        });

        // Documentos académicos generados
        Schema::create('documentos_academicos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alumno_id')->constrained()->onDelete('cascade');
            $table->enum('tipo', [
                'constancia_estudios', 'kardex', 'boleta', 'certificado',
                'carta_pasante', 'diploma', 'credencial'
            ]);
            $table->string('folio', 30)->unique();
            $table->string('archivo', 255)->nullable();
            $table->foreignId('generado_por')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('fecha_generacion')->useCurrent();
            $table->boolean('vigente')->default(true);
            $table->timestamps();

            $table->index(['alumno_id', 'tipo']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documentos_academicos');
        Schema::dropIfExists('historial_academico');
        Schema::dropIfExists('asistencias');
        Schema::dropIfExists('calificaciones');
        Schema::dropIfExists('inscripciones');
    }
};
