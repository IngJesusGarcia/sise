<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('actividad_usuarios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('accion', 10);       // GET, POST, PUT, DELETE
            $table->string('modulo', 60);
            $table->string('url', 500);
            $table->string('ip', 45)->nullable();
            $table->string('user_agent', 300)->nullable();
            $table->text('payload')->nullable();
            $table->smallInteger('status_code')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index('modulo');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('actividad_usuarios');
    }
};
