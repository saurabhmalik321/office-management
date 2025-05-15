<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Repositories\UserRepository;
use App\Interface\UserInterface;
use Illuminate\Support\Facades\Vite;
use App\Services\UserService;
use App\Models\User;
use App\Observers\UserObserver;
use Illuminate\Filesystem\Filesystem;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //  $this->app->bind('files', function () {
        // return new Filesystem;
    // });
        $this->app->bind(UserInterface::class, UserRepository::class);
    }

    public function boot(): void 
    {
        Vite::prefetch(concurrency: 3);
        User::observe(UserObserver::class);
    }
}
