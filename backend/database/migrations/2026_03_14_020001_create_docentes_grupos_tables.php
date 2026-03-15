<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Docentes
        Schema::create('docentes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('nombre', 80);
            $table->string('apellido_paterno', 60);
            $table->string('apellido_materno', 60)->nullable();
            $table->string('rfc', 13)->unique()->nullable();
            $table->string('curp', 18)->unique()->nullable();
            $table->string('correo', 120)->unique()->nullable();
            $table->string('telefono', 15)->nullable();
            $table->string('grado_academico', 40)->nullable(); // Lic., M.C., Dr.
            $table->enum('tipo_contrato', ['tiempo_completo', 'medio_tiempo', 'por_horas'])->default('por_horas');
            $table->boolean('activo')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['activo', 'apellido_paterno']);
        });

        // Grupos académicos
        Schema::create('grupos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('licenciatura_id')->constrained()->onDelete('cascade');
            $table->foreignId('plan_estudio_id')->constrained('planes_estudio')->onDelete('cascade');
            $table->foreignId('periodo_id')->constrained('periodos')->onDelete('cascade');
            $table->foreignId('docente_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('materia_id')->constrained()->onDelete('cascade');
            $table->string('clave_grupo', 20);
            $table->unsignedTinyInteger('semestre');
            $table->unsignedSmallInteger('capacidad')->default(30);
            $table->unsignedSmallInteger('inscritos')->default(0);
            $table->string('aula', 30)->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();

            $table->unique(['clave_grupo', 'periodo_id']);
            $table->index(['periodo_id', 'licenciatura_id']);
            $table->index('docente_id');
        });

        // Horarios de grupos
        Schema::create('horarios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('grupo_id')->constrained()->onDelete('cascade');
            $table->enum('dia', ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']);
            $table->time('hora_inicio');
            $table->time('hora_fin');
            $table->string('aula', 30)->nullable();
            $table->timestamps();

            $table->index('grupo_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('horarios');
        Schema::dropIfExists('grupos');
        Schema::dropIfExists('docentes');
    }
};
