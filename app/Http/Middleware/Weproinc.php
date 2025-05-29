<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class Weproinc
{
    public function handle(Request $request, Closure $next)
    {
        $token = $request->header('X-Weproinc-Token');
        if ($token !== env('WEPROINC_API_TOKEN')) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        return $next($request);
    }
}
