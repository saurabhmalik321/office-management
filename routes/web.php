<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (Auth::check()) {
        // If user is logged in, show dashboard or redirect
        return redirect()->route('dashboard');
    } else {
        // If user is not logged in, show the login page
        return Inertia::render('Auth/Login');
    }
});

Route::get('/admin', function () {
    if (Auth::check()) {
        // If user is logged in, show dashboard or redirect
        return redirect()->route('dashboard');
    } else {
        // If user is not logged in, show the login page
        return Inertia::render('Auth/AdminLogin');
    }
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/manageusers', function () {
    return Inertia::render('Manageusers');
})->middleware(['auth', 'verified'])->name('manageusers');

Route::get('/manageleaves', function () {
    return Inertia::render('ManageLeaves');
})->middleware(['auth', 'verified'])->name('manageleaves');

Route::get('/managesalaries', function () {
    return Inertia::render('ManageSalaries');
})->middleware(['auth', 'verified'])->name('managesalaries');



Route::middleware(['auth', 'check.user.role:admin,hr'])->group(function () {
    Route::get('/list', [UserController::class, 'index'])->name('user.list');
    Route::delete('/admin/users/{id}', [UserController::class, 'destroy'])->name('users.destroy');
    Route::get('/admin/users/{id}/edit', [UserController::class, 'edit'])->name('users.edit');
    Route::put('/admin/users/{id}', [UserController::class, 'update'])->name('users.update');

});

Route::get('/list', [UserController::class, 'index'])
    ->name('user.list')
    ->middleware(['auth', 'check.user.role:admin,hr']);
    Route::get('/dashboard', [UserController::class, 'dashboard'])->name('dashboard');

Route::group(['prefix' => 'admin'], function () {
    Route::post('/users', [UserController::class, 'store'])->middleware(['auth']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
    Route::post('/user/leaves/{id}', [UserController::class, 'userLeaves']);
    Route::post('/user/salary/{id}', [UserController::class, 'userSalary']);
    Route::get('/pending-leave', [UserController::class, 'pendingLeave']);
    Route::get('/employee-inquiry', [UserController::class, 'getInquiry']);
     Route::get('/histories', [UserController::class, 'getHistory']);

});
Route::get('/chat', function () {
    return Inertia::render('ChatBot');
})->name('chat');
Route::post('/chat', [UserController::class, 'handleMessage']);
Route::middleware(['auth'])->group(function () {
    Route::post('/notifications', [UserController::class, 'sendNotification']);
    Route::get('/employee', [UserController::class, 'onlyEmployee']);
    Route::get('/notification/{id}', [UserController::class, 'getNotification']);
});

Route::middleware('auth')->group(function () {
    // Salary
    Route::get('/salaries', [UserController::class, 'indexSalaries']);
    Route::get('/salary-status', [UserController::class, 'getSalaryStatus']);
    Route::post('/salaries', [UserController::class, 'storeSalary']);
    Route::post('/salaries/paid/{id}', [UserController::class, 'markSalaryAsPaid']);
    Route::put('/salaries/edit/{id}', [UserController::class, 'updateSalary']);
    // Leave
    Route::get('/leaves', [UserController::class, 'indexLeaves']);
    Route::post('/leaves', [UserController::class, 'storeLeave']);
    Route::post('/leave-request/{id}', [UserController::class, 'updateLeaveStatus']);
    // Inquiry
    Route::get('/admin-hr-users', [UserController::class, 'getAdminHrUsers']);
    Route::post('/inquiries', [UserController::class, 'sendInquiry']);

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});
// Route::middleware('auth')->group(function () {
// Route::get('/{any}', function () {
//     return \File::get(public_path('spa/index.html'));
// })->where('any', '^(?!api).*$');

require __DIR__.'/auth.php';
