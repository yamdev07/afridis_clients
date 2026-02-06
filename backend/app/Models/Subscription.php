<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'agent_id',
        'service_id',
        'status_id',
        'line_number',
        'subscription_date',
        'planned_installation_date',
        'installation_date',
        'contract_cost',
        'notes',
    ];

    protected $casts = [
        'subscription_date' => 'date',
        'planned_installation_date' => 'date',
        'installation_date' => 'date',
        'contract_cost' => 'decimal:2',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function agent()
    {
        return $this->belongsTo(Agent::class);
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function status()
    {
        return $this->belongsTo(Status::class);
    }

    public function installationEvents()
    {
        return $this->hasMany(InstallationEvent::class);
    }

    public function statusHistory()
    {
        return $this->hasMany(SubscriptionStatusHistory::class);
    }
}

