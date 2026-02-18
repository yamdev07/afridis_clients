<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Api\InstallationEventController;
use App\Http\Controllers\Api\DashboardController;

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
});

Route::middleware('auth:api')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::get('me', [AuthController::class, 'me']);
        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('refresh', [AuthController::class, 'refresh']);
    });

    Route::apiResource('clients', ClientController::class);
    Route::get('services', [ServiceController::class, 'index']);

    Route::get('subscriptions', [SubscriptionController::class, 'index']);
    Route::post('subscriptions', [SubscriptionController::class, 'store']);
    Route::get('subscriptions/{subscription}', [SubscriptionController::class, 'show']);
    Route::put('subscriptions/{subscription}', [SubscriptionController::class, 'update']);

    Route::get('subscriptions/{subscription}/events', [InstallationEventController::class, 'index']);
    Route::post('subscriptions/{subscription}/events', [InstallationEventController::class, 'store']);

    Route::get('dashboard/summary', [DashboardController::class, 'summary']);
})
;
