<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // 1. Tipos de documento
        Schema::create('tipos_documento', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100)->unique();
            $table->string('descripcion', 300)->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });

        // 2. Documentos / oficios
        Schema::create('documentos', function (Blueprint $table) {
            $table->id();
            $table->string('folio', 40)->unique();
            $table->foreignId('tipo_documento_id')->constrained('tipos_documento')->onDelete('restrict');
            $table->string('asunto', 255);
            $table->text('descripcion')->nullable();
            $table->string('area_origen', 120);
            $table->string('area_destino', 120);
            $table->string('responsable', 150)->nullable();
            $table->date('fecha');
            $table->enum('estatus', ['registrado','en_proceso','aprobado','rechazado','archivado'])->default('registrado');
            $table->string('archivo', 255)->nullable();        // stored path
            $table->foreignId('creado_por')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['estatus','fecha']);
            $table->index(['area_origen','area_destino']);
        });

        // 3. Historial de aprobaciones
        Schema::create('aprobaciones_documento', function (Blueprint $table) {
            $table->id();
            $table->foreignId('documento_id')->constrained('documentos')->onDelete('cascade');
            $table->foreignId('usuario_id')->constrained('users')->onDelete('cascade');
            $table->enum('estatus', ['aprobado','rechazado','en_revision'])->default('en_revision');
            $table->text('comentarios')->nullable();
            $table->timestamp('fecha')->nullable();
            $table->timestamps();

            $table->index(['documento_id','estatus']);
        });

        // 4. Archivos adjuntos adicionales por documento
        Schema::create('documentos_archivo', function (Blueprint $table) {
            $table->id();
            $table->foreignId('documento_id')->constrained('documentos')->onDelete('cascade');
            $table->string('nombre_archivo', 255);
            $table->string('ruta', 500);
            $table->string('tipo_mime', 100)->nullable();
            $table->unsignedBigInteger('tamanio')->nullable();  // bytes
            $table->foreignId('subido_por')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documentos_archivo');
        Schema::dropIfExists('aprobaciones_documento');
        Schema::dropIfExists('documentos');
        Schema::dropIfExists('tipos_documento');
    }
};
