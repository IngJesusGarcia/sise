<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Movimientos académicos (cambios de grupo, licenciatura, turno, sede)
        Schema::create('movimientos_academicos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alumno_id')->constrained('alumnos')->onDelete('cascade');
            $table->enum('tipo_movimiento', ['cambio_licenciatura', 'cambio_grupo', 'cambio_turno', 'cambio_sede']);
            $table->string('valor_anterior', 200);
            $table->string('valor_nuevo', 200);
            $table->text('motivo')->nullable();
            $table->date('fecha_movimiento');
            $table->foreignId('registrado_por')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['alumno_id', 'tipo_movimiento']);
            $table->index('fecha_movimiento');
        });

        // Movilidad estudiantil (estudiantes de otras instituciones)
        Schema::create('movilidad_estudiantil', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alumno_id')->nullable()->constrained('alumnos')->nullOnDelete();
            $table->string('nombre_visitante', 150)->nullable(); // si no es alumno local
            $table->string('universidad_origen', 200);
            $table->string('programa_origen', 200);
            $table->string('periodo_movilidad', 30);
            $table->text('materias_equivalentes')->nullable(); // JSON o texto libre
            $table->enum('estatus', ['activo', 'completado', 'cancelado'])->default('activo');
            $table->foreignId('registrado_por')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['estatus', 'periodo_movilidad']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('movilidad_estudiantil');
        Schema::dropIfExists('movimientos_academicos');
    }
};
