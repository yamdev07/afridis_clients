<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubscriptionStatusHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'subscription_id',
        'old_status_id',
        'new_status_id',
        'changed_at',
        'changed_by_user_id',
        'comment',
    ];

    protected $casts = [
        'changed_at' => 'datetime',
    ];

    public function subscription()
    {
        return $this->belongsTo(Subscription::class);
    }
}

