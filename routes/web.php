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

Route::get('/manage-users', function () {
    return Inertia::render('Manageusers');
})->middleware(['auth', 'verified'])->name('manage-users');

Route::get('/manage-leaves', function () {
    return Inertia::render('ManageLeaves');
})->middleware(['auth', 'verified'])->name('manage-leaves');

Route::get('/manage-salaries', function () {
    return Inertia::render('ManageSalaries');
})->middleware(['auth', 'verified'])->name('manage-salaries');
Route::get('/performances', [UserController::class, 'getPerformance'])
    ->middleware(['auth', 'verified'])
    ->name('performances.index');

Route::post('/performances', [UserController::class, 'storePerformance'])->name('performances.store');

Route::get('/messages/{userId}',  [UserController::class, 'getPerformance']) ->middleware(['auth', 'verified'])
    ->name('message');
// Route::get('/messages', function () {
//     return Inertia::render('ChatBox');
// })->middleware(['auth', 'verified'])->name('messages');
// routes/web.php
Route::get('/settings', function () {
    return Inertia::render('Settings');
})->name('settings');


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
    Route::get('/performance', [UserController::class, 'getPerformances']);
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
    Route::post('/notification/seen', [UserController::class, 'NotificationSeen']);
    Route::get('/employee', [UserController::class, 'onlyEmployee']);
    Route::get('/notification/{id}', [UserController::class, 'getNotification']);
    Route::delete('/notifications/{id}', [UserController::class, 'deleteNotification']);
    Route::get('/seen-notification', [UserController::class, 'notificationSeenData']);
});

Route::middleware('auth')->group(function () {
    // Salary
    Route::get('/single-salaries', [UserController::class, 'getSingleUserSalaries']);
    Route::get('/salaries', [UserController::class, 'indexSalaries']);
    Route::get('/salary-status', [UserController::class, 'getSalaryStatus']);
    Route::post('/salaries', [UserController::class, 'storeSalary']);
    Route::post('/salaries/paid/{id}', [UserController::class, 'markSalaryAsPaid']);
    Route::put('/salaries/edit/{id}', [UserController::class, 'updateSalary']);
    // Leave
    Route::get('/leaves', [UserController::class, 'indexLeaves']);
    Route::post('/leaves', [UserController::class, 'storeLeave']);
    Route::post('/leave-request/{id}', [UserController::class, 'updateLeaveStatus']);
     Route::get('/single-leave', [UserController::class, 'getSingleUserLeave']);
    // Inquiry
    Route::get('/admin-hr-users', [UserController::class, 'getAdminHrUsers']);
    Route::post('/inquiries', [UserController::class, 'sendInquiry']);
    Route::delete('/inquiries/{id}', [UserController::class, 'deleteInquiry']);


    // company policies
    Route::get('/policies', [UserController::class, 'getPolicies'])->name('policies.index');
    Route::post('/policies', [UserController::class, 'storePolicies'])->name('policies.store');
    Route::get('/policies/download/{policy}', [UserController::class, 'download'])->name('policies.download');
    Route::get('/policies/view/{id}', [UserController::class, 'viewDoc'])->name('policies.view');
    Route::delete('/policies/{id}', [UserController::class, 'deletePolicy'])->name('policies.destroy');

    // user performace
    Route::get('/performance/user', [UserController::class, 'getUserPerformace']);
    //message/chat
    Route::post('/messages', [UserController::class, 'storeMessages'])->name('message.store');
    Route::get('/messages', [UserController::class, 'getAllMessages'])->name('messages');
    Route::get('/salaries/filter', [UserController::class, 'filter']);
    Route::put('/salaries/add', [UserController::class, 'updateNewSalaries']);
    Route::post('/salary/calculate-preview', [UserController::class, 'calculatePreview']);
    Route::get('/leave-count', [UserController::class, 'getPreviousMonthLeaveDaysForEmployee']);
    Route::put('/reset-password', [UserController::class, 'resetPassword']);
    Route::post('/salary-view', [UserController::class, 'viewSalary']);
    Route::get('/bonus/{id}', [UserController::class, 'getBonus']);

    Route::post('/update/date', [UserController::class, 'putDate']);
    Route::get('/date/get', [UserController::class, 'getDate']);

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
