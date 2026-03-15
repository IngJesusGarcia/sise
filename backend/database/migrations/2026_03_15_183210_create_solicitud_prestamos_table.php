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
        Schema::create('solicitudes_prestamo', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('equipo_id')->constrained('equipos_prestamo')->onDelete('restrict');
            $table->dateTime('fecha_solicitud');
            $table->date('fecha_prestamo');
            $table->date('fecha_devolucion');
            $table->text('motivo');
            $table->enum('estatus', ['pendiente', 'aprobado', 'rechazado', 'devuelto'])->default('pendiente');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('solicitudes_prestamo');
    }
};
