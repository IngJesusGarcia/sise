<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Aspirantes
        Schema::create('aspirantes', function (Blueprint $table) {
            $table->id();
            $table->string('folio', 20)->unique();
            $table->string('nombre', 80);
            $table->string('apellido_paterno', 60);
            $table->string('apellido_materno', 60)->nullable();
            $table->date('fecha_nacimiento');
            $table->enum('sexo', ['M', 'F', 'Otro'])->nullable();
            $table->string('curp', 18)->unique()->nullable();
            $table->string('correo', 120)->nullable();
            $table->string('telefono', 15)->nullable();
            $table->foreignId('licenciatura_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('estatus', ['registrado', 'admitido', 'rechazado', 'convertido'])->default('registrado');
            $table->string('ciclo_ingreso', 10)->nullable();
            $table->timestamps();

            $table->index(['estatus', 'created_at']);
            $table->index('licenciatura_id');
        });

        // Alumnos
        Schema::create('alumnos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('aspirante_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('licenciatura_id')->constrained()->onDelete('cascade');
            $table->foreignId('plan_estudio_id')->constrained('planes_estudio')->onDelete('cascade');
            $table->string('matricula', 15)->unique();
            $table->string('nombre', 80);
            $table->string('apellido_paterno', 60);
            $table->string('apellido_materno', 60)->nullable();
            $table->date('fecha_nacimiento');
            $table->enum('sexo', ['M', 'F', 'Otro'])->nullable();
            $table->string('curp', 18)->unique()->nullable();
            $table->string('rfc', 13)->unique()->nullable();
            $table->string('correo', 120)->unique()->nullable();
            $table->string('telefono', 15)->nullable();
            $table->string('celular', 15)->nullable();
            $table->string('foto', 255)->nullable();
            $table->unsignedTinyInteger('semestre_actual')->default(1);
            $table->enum('turno', ['Matutino', 'Vespertino', 'Mixto'])->default('Matutino');
            $table->enum('estatus', [
                'activo', 'baja_temporal', 'baja_definitiva',
                'egresado', 'titulado', 'egresado_sin_titulo'
            ])->default('activo');
            $table->string('ciclo_ingreso', 10)->nullable();
            $table->string('promedio_general', 5)->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Índices para búsquedas frecuentes (20k+ alumnos)
            $table->index('matricula');
            $table->index(['licenciatura_id', 'estatus']);
            $table->index(['apellido_paterno', 'apellido_materno']);
            $table->index('estatus');
            $table->index('semestre_actual');
        });

        // Datos personales extendidos
        Schema::create('datos_personales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alumno_id')->constrained()->onDelete('cascade');
            $table->string('calle', 150)->nullable();
            $table->string('colonia', 100)->nullable();
            $table->string('municipio', 100)->nullable();
            $table->string('estado', 60)->nullable();
            $table->string('cp', 6)->nullable();
            $table->string('pais', 60)->default('México');
            $table->string('lugar_nacimiento', 150)->nullable();
            $table->string('estado_civil', 30)->nullable();
            $table->string('religion', 60)->nullable();
            $table->string('grupo_etnico', 60)->nullable();
            $table->string('lengua_indigena', 60)->nullable();
            $table->string('tipo_sangre', 5)->nullable();
            $table->text('alergias')->nullable();
            $table->text('enfermedades_cronicas')->nullable();
            $table->string('seguro_social', 12)->nullable();
            $table->string('nss', 11)->nullable();
            $table->timestamps();

            $table->unique('alumno_id');
        });

        // Datos familiares
        Schema::create('datos_familiares', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alumno_id')->constrained()->onDelete('cascade');
            $table->enum('parentesco', ['padre', 'madre', 'tutor', 'otro']);
            $table->string('nombre', 150);
            $table->string('correo', 120)->nullable();
            $table->string('telefono', 15)->nullable();
            $table->string('celular', 15)->nullable();
            $table->string('ocupacion', 80)->nullable();
            $table->string('escolaridad', 60)->nullable();
            $table->boolean('vive')->default(true);
            $table->boolean('es_contacto_emergencia')->default(false);
            $table->timestamps();

            $table->index('alumno_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('datos_familiares');
        Schema::dropIfExists('datos_personales');
        Schema::dropIfExists('alumnos');
        Schema::dropIfExists('aspirantes');
    }
};
