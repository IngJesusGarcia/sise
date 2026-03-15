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
        $this->addIndexIfNotExists('alumnos', ['created_at']);
        $this->addIndexIfNotExists('docentes', ['created_at']);
        $this->addIndexIfNotExists('licenciaturas', ['activa']);
        $this->addIndexIfNotExists('licenciaturas', ['created_at']);
        $this->addIndexIfNotExists('grupos', ['licenciatura_id']);
        $this->addIndexIfNotExists('grupos', ['periodo_id']);
        $this->addIndexIfNotExists('grupos', ['semestre']);
        $this->addIndexIfNotExists('grupos', ['created_at']);
        $this->addIndexIfNotExists('inscripciones', ['estatus']);
        $this->addIndexIfNotExists('inscripciones', ['created_at']);
        $this->addIndexIfNotExists('calificaciones', ['created_at']);
        
        // Pagos y Lineas de Captura
        $this->addIndexIfNotExists('pagos', ['created_at']);
        $this->addIndexIfNotExists('lineas_captura', ['estatus']);
        $this->addIndexIfNotExists('lineas_captura', ['created_at']);
        $this->addIndexIfNotExists('lineas_captura', ['fecha_vencimiento']);

        $this->addIndexIfNotExists('servicio_social_registros', ['estatus']);
        $this->addIndexIfNotExists('servicio_social_registros', ['created_at']);
        $this->addIndexIfNotExists('equipos_prestamo', ['estado']);
        $this->addIndexIfNotExists('equipos_prestamo', ['created_at']);
        $this->addIndexIfNotExists('solicitudes_prestamo', ['estatus']);
        $this->addIndexIfNotExists('solicitudes_prestamo', ['created_at']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $this->dropIndexIfExists('solicitudes_prestamo', ['estatus']);
        $this->dropIndexIfExists('solicitudes_prestamo', ['created_at']);
        $this->dropIndexIfExists('equipos_prestamo', ['estado']);
        $this->dropIndexIfExists('equipos_prestamo', ['created_at']);
        $this->dropIndexIfExists('servicio_social_registros', ['estatus']);
        $this->dropIndexIfExists('servicio_social_registros', ['created_at']);
        
        $this->dropIndexIfExists('lineas_captura', ['fecha_vencimiento']);
        $this->dropIndexIfExists('lineas_captura', ['created_at']);
        $this->dropIndexIfExists('lineas_captura', ['estatus']);
        $this->dropIndexIfExists('pagos', ['created_at']);

        $this->dropIndexIfExists('calificaciones', ['created_at']);
        $this->dropIndexIfExists('inscripciones', ['estatus']);
        $this->dropIndexIfExists('inscripciones', ['created_at']);
        $this->dropIndexIfExists('grupos', ['licenciatura_id']);
        $this->dropIndexIfExists('grupos', ['periodo_id']);
        $this->dropIndexIfExists('grupos', ['semestre']);
        $this->dropIndexIfExists('grupos', ['created_at']);
        $this->dropIndexIfExists('licenciaturas', ['activa']);
        $this->dropIndexIfExists('licenciaturas', ['created_at']);
        $this->dropIndexIfExists('docentes', ['created_at']);
        $this->dropIndexIfExists('alumnos', ['created_at']);
    }

    protected function addIndexIfNotExists(string $table, array $columns)
    {
        $indexName = $table . '_' . implode('_', $columns) . '_index';
        $exists = collect(DB::select("SHOW INDEXES FROM {$table}"))->contains('Key_name', $indexName);

        if (!$exists) {
            Schema::table($table, function (Blueprint $table) use ($columns) {
                $table->index($columns);
            });
        }
    }

    protected function dropIndexIfExists(string $table, array $columns)
    {
        $indexName = $table . '_' . implode('_', $columns) . '_index';
        $exists = collect(DB::select("SHOW INDEXES FROM {$table}"))->contains('Key_name', $indexName);

        if ($exists) {
            Schema::table($table, function (Blueprint $table) use ($columns) {
                $table->dropIndex($columns);
            });
        }
    }
};
