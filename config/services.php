<?php

return [
    /*
    |--------------------------------------------------------------------------
    | SMS Provider Configuration
    |--------------------------------------------------------------------------
    |
    | Supported drivers: 'log', 'twilio'
    |
    */
    'sms' => [
        'default' => env('SMS_DRIVER', 'log'),

        'drivers' => [
            'twilio' => [
                'account_sid' => env('TWILIO_ACCOUNT_SID'),
                'auth_token'  => env('TWILIO_AUTH_TOKEN'),
                'from'        => env('TWILIO_FROM'),
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Payment Gateway Configuration
    |--------------------------------------------------------------------------
    |
    | Supported drivers: 'log', 'orange_money', 'moov_money'
    |
    */
    'payment' => [
        'default' => env('PAYMENT_DRIVER', 'log'),

        'orange_money' => [
            'merchant_key'  => env('ORANGE_MERCHANT_KEY'),
            'client_id'     => env('ORANGE_CLIENT_ID'),
            'client_secret' => env('ORANGE_CLIENT_SECRET'),
            'sandbox'       => env('ORANGE_SANDBOX', true),
        ],

        'moov_money' => [
            'api_key'  => env('MOOV_API_KEY'),
            'sandbox'  => env('MOOV_SANDBOX', true),
        ],
    ],
];
