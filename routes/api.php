<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{UserController};

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix("/v1")->group(function() {
    Route::prefix("/weproinc")->group(function() {
        Route::post("/contact", [UserController::class, 'postContact']);
        Route::get("/contact/list", [UserController::class, 'getContacts']);
        Route::post("/quote", [UserController::class, 'getQoute']);
    });
});
