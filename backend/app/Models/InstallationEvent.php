<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InstallationEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'subscription_id',
        'status_id',
        'event_type',
        'event_date',
        'comment',
    ];

    protected $casts = [
        'event_date' => 'datetime',
    ];

    public function subscription()
    {
        return $this->belongsTo(Subscription::class);
    }

    public function status()
    {
        return $this->belongsTo(Status::class);
    }
}

