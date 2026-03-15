<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Correspondencia (oficios)
        Schema::create('oficios', function (Blueprint $table) {
            $table->id();
            $table->string('folio', 30)->unique();
            $table->string('asunto', 300);
            $table->string('destinatario', 200);
            $table->string('area_destino', 120)->nullable();
            $table->string('remitente', 200)->nullable();
            $table->string('area_origen', 120)->nullable();
            $table->enum('tipo', ['oficio', 'circular', 'memo', 'convocatoria', 'otro'])->default('oficio');
            $table->enum('prioridad', ['normal', 'urgente', 'confidencial'])->default('normal');
            $table->enum('estatus', ['borrador', 'enviado', 'recibido', 'en_proceso', 'atendido', 'archivado'])->default('borrador');
            $table->date('fecha_oficio');
            $table->date('fecha_limite')->nullable();
            $table->text('contenido')->nullable();
            $table->string('archivo', 255)->nullable();
            $table->foreignId('creado_por')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['estatus', 'fecha_oficio']);
            $table->index('area_origen');
        });

        // Seguimiento de documentos
        Schema::create('seguimiento_documentos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('oficio_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('accion', 80);
            $table->text('comentario')->nullable();
            $table->timestamps();

            $table->index('oficio_id');
        });

        // ── JURÍDICO ─────────────────────────────────────────
        Schema::create('expedientes_juridicos', function (Blueprint $table) {
            $table->id();
            $table->string('numero_expediente', 30)->unique();
            $table->string('asunto', 300);
            $table->string('contraparte', 200)->nullable();
            $table->enum('tipo', ['laboral', 'civil', 'administrativo', 'penal', 'mercantil', 'otro'])->default('laboral');
            $table->enum('estatus', ['activo', 'suspendido', 'resuelto', 'archivado'])->default('activo');
            $table->date('fecha_apertura');
            $table->date('fecha_cierre')->nullable();
            $table->string('juzgado', 200)->nullable();
            $table->string('abogado_asignado', 150)->nullable();
            $table->text('observaciones')->nullable();
            $table->foreignId('creado_por')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['tipo', 'estatus']);
        });

        // Convenios institucionales
        Schema::create('convenios', function (Blueprint $table) {
            $table->id();
            $table->string('numero_convenio', 30)->unique();
            $table->string('titulo', 300);
            $table->string('contraparte', 200);
            $table->enum('tipo', ['colaboracion', 'servicio_social', 'investigacion', 'becas', 'otro'])->default('colaboracion');
            $table->date('fecha_firma');
            $table->date('fecha_inicio');
            $table->date('fecha_vencimiento')->nullable();
            $table->boolean('renovable')->default(false);
            $table->enum('estatus', ['vigente', 'vencido', 'en_revision', 'cancelado'])->default('vigente');
            $table->string('archivo', 255)->nullable();
            $table->text('objeto')->nullable();
            $table->foreignId('creado_por')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['estatus', 'fecha_vencimiento']);
        });

        // ── VINCULACIÓN ──────────────────────────────────────
        Schema::create('servicio_social', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alumno_id')->constrained()->onDelete('cascade');
            $table->string('numero_registro', 30)->unique();
            $table->string('dependencia', 200);
            $table->string('programa', 200);
            $table->string('asesor_interno', 150)->nullable();
            $table->string('asesor_externo', 150)->nullable();
            $table->date('fecha_inicio');
            $table->date('fecha_fin_programada');
            $table->date('fecha_fin_real')->nullable();
            $table->unsignedSmallInteger('horas_requeridas')->default(480);
            $table->unsignedSmallInteger('horas_completadas')->default(0);
            $table->enum('estatus', ['en_proceso', 'completado', 'baja', 'suspendido'])->default('en_proceso');
            $table->timestamps();

            $table->index(['alumno_id', 'estatus']);
        });

        // Seguimiento de servicio social
        Schema::create('seguimiento_servicio_social', function (Blueprint $table) {
            $table->id();
            $table->foreignId('servicio_social_id')->constrained('servicio_social')->onDelete('cascade');
            $table->date('fecha');
            $table->unsignedSmallInteger('horas_reportadas')->default(0);
            $table->text('actividades')->nullable();
            $table->enum('tipo', ['parcial', 'final', 'evaluacion'])->default('parcial');
            $table->foreignId('revisado_por')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // Proyectos de investigación
        Schema::create('proyectos_investigacion', function (Blueprint $table) {
            $table->id();
            $table->string('titulo', 300);
            $table->string('clave', 30)->unique()->nullable();
            $table->text('descripcion')->nullable();
            $table->string('lider', 150)->nullable();
            $table->date('fecha_inicio');
            $table->date('fecha_fin')->nullable();
            $table->enum('estatus', ['activo', 'terminado', 'suspendido'])->default('activo');
            $table->string('fuente_financiamiento', 150)->nullable();
            $table->decimal('presupuesto', 12, 2)->nullable();
            $table->timestamps();
        });

        // Repositorio institucional
        Schema::create('repositorio', function (Blueprint $table) {
            $table->id();
            $table->string('titulo', 300);
            $table->string('autor', 200)->nullable();
            $table->enum('tipo', ['tesis', 'articulo', 'ponencia', 'libro', 'manual', 'otro'])->default('tesis');
            $table->year('anio')->nullable();
            $table->string('archivo', 255)->nullable();
            $table->text('resumen')->nullable();
            $table->boolean('publico')->default(true);
            $table->foreignId('subido_por')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['tipo', 'anio']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('repositorio');
        Schema::dropIfExists('proyectos_investigacion');
        Schema::dropIfExists('seguimiento_servicio_social');
        Schema::dropIfExists('servicio_social');
        Schema::dropIfExists('convenios');
        Schema::dropIfExists('expedientes_juridicos');
        Schema::dropIfExists('seguimiento_documentos');
        Schema::dropIfExists('oficios');
    }
};
