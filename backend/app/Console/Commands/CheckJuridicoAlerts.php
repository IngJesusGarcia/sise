<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\ConvenioContrato;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class CheckJuridicoAlerts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'juridico:check-alertas';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verifica los convenios jurídicos e identifica los que vencen en 60, 30 y 15 días, o aquellos ya vencidos.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Iniciando verificación de vencimientos jurídicos...');
        
        $hoy = \Carbon\Carbon::now()->startOfDay();

        $convenios = ConvenioContrato::whereNotNull('fecha_vencimiento')->get();

        $alertasGeneradas = 0;

        foreach ($convenios as $convenio) {
            $vencimiento = \Carbon\Carbon::parse($convenio->fecha_vencimiento)->startOfDay();
            $diasRestantes = $hoy->diffInDays($vencimiento, false);

            if ($diasRestantes == 60 || $diasRestantes == 30 || $diasRestantes == 15 || $diasRestantes == 0 || $diasRestantes == -1) {
                // Generar log o enviar correo / notificación in-app
                $estado = $diasRestantes <= 0 ? ($diasRestantes == 0 ? 'VENCE HOY' : 'VENCIDO') : "Vence en $diasRestantes días";
                
                $msg = "ALERTA JURÍDICA: El Convenio [{$convenio->numero_control}] '{$convenio->tipo_convenio}' $estado.";
                Log::channel('daily')->warning($msg);
                $this->warn($msg);

                // En un escenario de producción real, aquí crearíamos un registro
                // en la tabla `notifications` nativa de Laravel para los usuarios
                // que tengan rol 'juridico' y 'admin'.
                
                /*
                $users = User::role(['admin', 'juridico'])->get();
                foreach($users as $user) {
                   $user->notify(new \App\Notifications\ConvenioPorVencer($convenio, $diasRestantes));
                }
                */

                $alertasGeneradas++;
            }
        }

        $this->info("Proceso finalizado. Total de alertas detonadas hoy: $alertasGeneradas");
        return 0;
    }
}
