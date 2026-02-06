<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://127.0.0.1:5173'], // <-- uniquement localhost
    'allowed_headers' => ['*'],
    'supports_credentials' => false,
];


