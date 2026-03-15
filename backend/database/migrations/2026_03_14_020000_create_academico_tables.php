<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Licenciaturas (programas educativos)
        Schema::create('licenciaturas', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 150);
            $table->string('clave', 20)->unique();
            $table->string('modalidad', 40)->default('Escolarizada'); // Escolarizada, Mixta, En línea
            $table->unsignedTinyInteger('duracion_semestres')->default(8);
            $table->boolean('activa')->default(true);
            $table->text('descripcion')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('activa');
        });

        // Planes de estudio
        Schema::create('planes_estudio', function (Blueprint $table) {
            $table->id();
            $table->foreignId('licenciatura_id')->constrained()->onDelete('cascade');
            $table->string('clave', 20)->unique();
            $table->year('anio_inicio');
            $table->boolean('vigente')->default(true);
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });

        // Períodos académicos (semestres)
        Schema::create('periodos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 80);           // Ej: "2024-A", "2024-B"
            $table->enum('tipo', ['semestral', 'cuatrimestral', 'anual'])->default('semestral');
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->date('fecha_inicio_inscripciones')->nullable();
            $table->date('fecha_fin_inscripciones')->nullable();
            $table->boolean('activo')->default(false);
            $table->timestamps();

            $table->index('activo');
        });

        // Catálogo de materias
        Schema::create('materias', function (Blueprint $table) {
            $table->id();
            $table->string('clave', 20)->unique();
            $table->string('nombre', 150);
            $table->unsignedTinyInteger('creditos')->default(6);
            $table->unsignedTinyInteger('horas_teoricas')->default(2);
            $table->unsignedTinyInteger('horas_practicas')->default(1);
            $table->enum('tipo', ['obligatoria', 'optativa', 'extracurricular'])->default('obligatoria');
            $table->boolean('activa')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['activa', 'tipo']);
        });

        // Relación materias-plan (semestre en que van)
        Schema::create('plan_materia', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plan_estudio_id')->constrained('planes_estudio')->onDelete('cascade');
            $table->foreignId('materia_id')->constrained()->onDelete('cascade');
            $table->unsignedTinyInteger('semestre');  // 1-10
            $table->unique(['plan_estudio_id', 'materia_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plan_materia');
        Schema::dropIfExists('materias');
        Schema::dropIfExists('periodos');
        Schema::dropIfExists('planes_estudio');
        Schema::dropIfExists('licenciaturas');
    }
};
