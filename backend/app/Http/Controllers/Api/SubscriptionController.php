<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Status;
use App\Models\Subscription;
use App\Models\SubscriptionStatusHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SubscriptionController extends Controller
{
    public function index(Request $request)
    {
        $query = Subscription::with(['client', 'service', 'status', 'agent']);

        if ($statusId = $request->query('status_id')) {
            $query->where('status_id', $statusId);
        }

        if ($agentId = $request->query('agent_id')) {
            $query->where('agent_id', $agentId);
        }

        return $query->orderByDesc('subscription_date')->paginate(20);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'client_id' => ['required', 'exists:clients,id'],
            'agent_id' => ['nullable', 'exists:agents,id'],
            'service_id' => ['required', 'exists:services,id'],
            'status_id' => ['required', 'exists:statuses,id'],
            'line_number' => ['nullable', 'string', 'max:100'],
            'subscription_date' => ['nullable', 'date'],
            'planned_installation_date' => ['nullable', 'date'],
            'installation_date' => ['nullable', 'date'],
            'contract_cost' => ['nullable', 'numeric'],
            'notes' => ['nullable', 'string'],
        ]);

        $subscription = Subscription::create($data);

        SubscriptionStatusHistory::create([
            'subscription_id' => $subscription->id,
            'old_status_id' => null,
            'new_status_id' => $subscription->status_id,
            'changed_at' => now(),
            'changed_by_user_id' => Auth::id(),
            'comment' => 'Création de l’abonnement',
        ]);

        return response()->json(
            $subscription->load('client', 'service', 'status'),
            201
        );
    }

    public function show(Subscription $subscription)
    {
        return $subscription->load(
            'client',
            'service',
            'status',
            'installationEvents',
            'statusHistory'
        );
    }

    public function update(Request $request, Subscription $subscription)
    {
        $data = $request->validate([
            'status_id' => ['sometimes', 'exists:statuses,id'],
            'line_number' => ['nullable', 'string', 'max:100'],
            'planned_installation_date' => ['nullable', 'date'],
            'installation_date' => ['nullable', 'date'],
            'contract_cost' => ['nullable', 'numeric'],
            'notes' => ['nullable', 'string'],
        ]);

        $originalStatusId = $subscription->status_id;

        $subscription->update($data);

        if (
            array_key_exists('status_id', $data)
            && $data['status_id'] !== $originalStatusId
        ) {
            SubscriptionStatusHistory::create([
                'subscription_id' => $subscription->id,
                'old_status_id' => $originalStatusId,
                'new_status_id' => $data['status_id'],
                'changed_at' => now(),
                'changed_by_user_id' => Auth::id(),
                'comment' => 'Mise à jour du statut',
            ]);
        }

        return response()->json(
            $subscription->load('client', 'service', 'status')
        );
    }
}

