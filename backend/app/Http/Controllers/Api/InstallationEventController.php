<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InstallationEvent;
use App\Models\Subscription;
use Illuminate\Http\Request;

class InstallationEventController extends Controller
{
    public function index(Subscription $subscription)
    {
        return $subscription->installationEvents()
            ->with('status')
            ->orderBy('event_date', 'desc')
            ->get();
    }

    public function store(Request $request, Subscription $subscription)
    {
        $data = $request->validate([
            'status_id' => ['nullable', 'exists:statuses,id'],
            'event_type' => ['required', 'string', 'max:100'],
            'event_date' => ['nullable', 'date'],
            'comment' => ['nullable', 'string'],
        ]);

        $event = $subscription->installationEvents()->create($data);

        return response()->json(
            $event->load('status'),
            201
        );
    }
}

