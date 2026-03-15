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
        Schema::create('equipos_prestamo', function (Blueprint $table) {
            $table->id();
            $table->string('codigo_inventario')->unique();
            $table->string('nombre_equipo');
            $table->string('categoria');
            $table->text('descripcion')->nullable();
            $table->enum('estado', ['disponible', 'prestado', 'mantenimiento'])->default('disponible');
            $table->string('ubicacion')->nullable();
            $table->date('fecha_registro');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipos_prestamo');
    }
};
