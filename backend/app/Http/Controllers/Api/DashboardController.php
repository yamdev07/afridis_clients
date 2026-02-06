<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Status;
use App\Models\Subscription;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function summary(): JsonResponse
    {
        $totalClients = Client::count();
        $totalSubscriptions = Subscription::count();

        $byStatus = Subscription::selectRaw('status_id, count(*) as total')
            ->groupBy('status_id')
            ->with('status')
            ->get()
            ->map(fn ($row) => [
                'status_id' => $row->status_id,
                'status_code' => optional($row->status)->code,
                'status_label' => optional($row->status)->label,
                'total' => $row->total,
            ]);

        $installedStatus = Status::where('code', Status::INSTALLED)->first();

        $installedCount = $installedStatus
            ? Subscription::where('status_id', $installedStatus->id)->count()
            : 0;

        return response()->json([
            'clients' => $totalClients,
            'subscriptions' => $totalSubscriptions,
            'installed' => $installedCount,
            'by_status' => $byStatus,
        ]);
    }
}

