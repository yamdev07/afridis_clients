<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Status extends Model
{
    use HasFactory;

    public const PENDING_INSTALL = 'PENDING_INSTALL';
    public const INSTALLED = 'INSTALLED';
    public const CANCELLED = 'CANCELLED';

    protected $fillable = [
        'code',
        'label',
    ];

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }
}

