<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::dropIfExists('servicio_social_documentos');
        Schema::dropIfExists('servicio_social_registros');
        Schema::dropIfExists('repositorio_proyectos_servicio');
        Schema::dropIfExists('reglamentos_servicio_social');
        Schema::dropIfExists('formatos_servicio_social');

        Schema::create('formatos_servicio_social', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->text('descripcion')->nullable();
            $table->string('archivo_pdf');
            $table->timestamp('fecha_subida')->useCurrent();
            $table->foreignId('subido_por')->constrained('users')->onDelete('cascade');
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });

        Schema::create('reglamentos_servicio_social', function (Blueprint $table) {
            $table->id();
            $table->string('titulo');
            $table->string('archivo_pdf');
            $table->string('version')->nullable();
            $table->timestamp('fecha_publicacion')->useCurrent();
            $table->boolean('activo')->default(false);
            $table->timestamps();
        });

        Schema::create('servicio_social_registros', function (Blueprint $table) {
            $table->id();
            $table->foreignId('estudiante_id')->constrained('alumnos')->onDelete('cascade');
            $table->string('institucion');
            $table->string('proyecto');
            $table->date('fecha_inicio');
            $table->date('fecha_fin')->nullable();
            $table->integer('horas_requeridas')->default(480);
            $table->integer('horas_acumuladas')->default(0);
            $table->enum('estatus', ['registrado', 'en proceso', 'terminado', 'liberado'])->default('registrado');
            $table->timestamps();
        });

        Schema::create('servicio_social_documentos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('estudiante_id')->constrained('alumnos')->onDelete('cascade');
            $table->enum('tipo_documento', ['Carta de aceptación', 'Plan de trabajo', 'Reporte mensual', 'Informe final', 'Carta de liberación']);
            $table->string('archivo');
            $table->timestamp('fecha_subida')->useCurrent();
            $table->enum('estatus', ['pendiente', 'aprobado', 'rechazado'])->default('pendiente');
            $table->timestamps();
        });

        Schema::create('repositorio_proyectos_servicio', function (Blueprint $table) {
            $table->id();
            $table->string('titulo');
            $table->text('descripcion');
            $table->string('archivo_pdf');
            $table->timestamp('fecha_subida')->useCurrent();
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('repositorio_proyectos_servicio');
        Schema::dropIfExists('servicio_social_documentos');
        Schema::dropIfExists('servicio_social_registros');
        Schema::dropIfExists('reglamentos_servicio_social');
        Schema::dropIfExists('formatos_servicio_social');
    }
};
