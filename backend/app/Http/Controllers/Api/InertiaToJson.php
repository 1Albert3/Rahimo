<?php

namespace App\Http\Controllers\Api;

use Inertia\Response as InertiaResponse;

/**
 * Trait InertiaToJson
 * Converts Inertia::render() responses to JSON for API controllers.
 */
trait InertiaToJson
{
    protected function toJson($response)
    {
        if ($response instanceof InertiaResponse) {
            // Extract props from Inertia response
            $page = $response->toResponse(request())->getData(true);
            $props = $page['props'] ?? [];
            return response()->json($props);
        }

        // Already a JsonResponse or other response
        if (method_exists($response, 'getData')) {
            $data = $response->getData(true);
            return response()->json($data);
        }

        return $response;
    }
}
