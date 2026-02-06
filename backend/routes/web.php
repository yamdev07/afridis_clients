<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/dashboard', function () {
    return view('dashboard');
});

Route::get('/clients', function () {
    return view('clients');
});

Route::get('/services', function () {
    return view('services');
});

Route::get('/reports', function () {
    return view('reports');
});