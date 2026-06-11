<?php
namespace App\Http\Controllers\Api\Admin;
use App\Http\Controllers\Controller;
use App\Http\Controllers\RhController;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index()
    {
        $rh = app(RhController::class);
        $r = $rh->usersIndex();
        if (request()->expectsJson() && method_exists($r, 'getData')) {
            return response()->json($r->getData());
        }
        return $r;
    }

    public function store(Request $request)
    {
        $rh = app(RhController::class);
        $r = $rh->usersStore($request);
        return request()->expectsJson() ? response()->json(['message' => 'Utilisateur créé.'], 201) : $r;
    }

    public function update(Request $request, User $user)
    {
        $rh = app(RhController::class);
        $r = $rh->usersUpdate($request, $user);
        return request()->expectsJson() ? response()->json(['message' => 'Utilisateur mis à jour.']) : $r;
    }

    public function destroy(User $user)
    {
        $rh = app(RhController::class);
        $r = $rh->usersDestroy($user);
        return request()->expectsJson() ? response()->json(['message' => 'Utilisateur supprimé.']) : $r;
    }

    public function updateProfile(Request $request)
    {
        $validated = $request->validate([
            'name'  => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $request->user()->id,
            'phone' => 'nullable|string|max:20',
            'city'  => 'nullable|string|max:100',
        ]);
        $request->user()->update($validated);
        return response()->json(['user' => $request->user()->fresh()]);
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'password'         => 'required|min:8|confirmed',
        ]);
        if (!Hash::check($request->current_password, $request->user()->password)) {
            return response()->json(['message' => 'Mot de passe actuel incorrect.'], 422);
        }
        $request->user()->update(['password' => Hash::make($request->password)]);
        return response()->json(['message' => 'Mot de passe mis à jour.']);
    }
}
