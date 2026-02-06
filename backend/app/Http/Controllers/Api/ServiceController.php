<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;

class ServiceController extends Controller
{
    public function index()
    {
        return Service::where('is_active', true)
            ->orderBy('monthly_price')
            ->get();
    }
}

