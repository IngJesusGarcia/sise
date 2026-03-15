<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('sesiones_activas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->unsignedBigInteger('token_id');
            $table->string('ip', 45)->nullable();
            $table->string('user_agent', 300)->nullable();
            $table->timestamp('ultima_actividad')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'token_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sesiones_activas');
    }
};
