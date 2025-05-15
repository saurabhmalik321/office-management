<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

Route::get('/', function () {
    return Auth::check() ? redirect()->route('dashboard') : Inertia::render('Auth/Login');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/manageusers', function () {
    return Inertia::render('Manageusers');
})->middleware(['auth', 'verified'])->name('manageusers');
 
Route::middleware(['auth', 'check.user.role:admin,hr'])->group(function () {
    Route::get('/list', [UserController::class, 'index'])->name('user.list');
    Route::delete('/admin/users/{id}', [UserController::class, 'destroy'])->name('users.destroy');
    Route::get('/admin/users/{id}/edit', [UserController::class, 'edit'])->name('users.edit');
    Route::put('/admin/users/{id}', [UserController::class, 'update'])->name('users.update');

});

// Route::get('/list', [UserController::class, 'index'])
//     ->name('user.list')
//     ->middleware(['auth', 'check.user.role:admin,hr']);

Route::group(['prefix' => 'admin'], function () {
    Route::post('/usersdata', [UserController::class, 'store']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
    Route::post('/user/leaves/{id}', [UserController::class, 'userLeaves']);
    Route::post('/user/salary/{id}', [UserController::class, 'userSalary']);
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Keep this at the bottom and exclude admin/api
// Route::get('/{any}', function () {
//     return \File::get(public_path('spa/index.html'));
// })->where('any', '^(?!admin|api).*$');

require __DIR__.'/auth.php';
