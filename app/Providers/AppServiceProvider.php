<?php

namespace App\Providers;

use App\Services\AnomalyDetectorService;
use App\Services\OpenAiInvoiceExtractorService;
use App\Services\MistralOcrService;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(MistralOcrService::class, function () {
            return new MistralOcrService(config('services.mistral.key'));
        });

        $this->app->singleton(OpenAiInvoiceExtractorService::class, function () {
            return new OpenAiInvoiceExtractorService(config('services.openai.key'));
        });

        $this->app->singleton(AnomalyDetectorService::class, fn () => new AnomalyDetectorService());
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Schema::defaultStringLength(191);
        Vite::prefetch(concurrency: 3);

        // Define global password validation rules
        Password::defaults(function () {
            return Password::min(8)
                ->mixedCase()
                ->numbers()
                ->symbols()
                ->uncompromised(3); // Allows up to 3 leaks before rejection
        });

        VerifyEmail::toMailUsing(function (object $notifiable, string $url) {
            return (new MailMessage)
                ->subject('Verify your email address - BillMind')
                ->view('emails.verify-email', ['url' => $url]);
        });

        ResetPassword::toMailUsing(function (object $notifiable, string $token) {
            $url = url(route('password.reset', [
                'token' => $token,
                'email' => $notifiable->getEmailForPasswordReset(),
            ], false));

            return (new MailMessage)
                ->subject('Reset your password - BillMind')
                ->view('emails.reset-password', ['url' => $url]);
        });
    }
}
