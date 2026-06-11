<?php
namespace App\Http\Controllers\Api\Admin;
use App\Http\Controllers\AdminController as Base;
use Illuminate\Http\Request;

class NotificationController extends Base
{
    public function index()
    {
        return response()->json(['message' => 'ok']);
    }

    public function send(Request $request)
    {
        parent::sendNotification($request);
        return response()->json(['message' => 'Notification envoyée.']);
    }
}
