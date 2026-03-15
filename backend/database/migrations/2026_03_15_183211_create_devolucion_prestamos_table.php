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
        Schema::create('devoluciones_prestamo', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prestamo_id')->constrained('solicitudes_prestamo')->onDelete('cascade');
            $table->dateTime('fecha_devolucion_real');
            $table->string('estado_equipo'); // ej. Bueno, Regular, Dañado
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('devoluciones_prestamo');
    }
};
