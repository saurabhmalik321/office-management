<?php

namespace App\Services;

use App\Models\User;
use App\Models\HrPolicy;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class PolicyService
{

    public function getPolicies()
    {
       return $policies = HrPolicy::with('uploader:id,name')->latest()->get();
    }

    public function storePolicies($data)
    {
        if (isset($data['file'])) {
        $path = $data['file']->store('policies', 'public');

        HrPolicy::create([
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'file_path' => $path,
            'uploaded_by' => auth()->id()
        ]);
        } else {
            throw new \Exception('Invalid or missing file in policy data.');
        }

    }
    public function viewDoc($id)
    {
        $policy = HrPolicy::findOrFail($id);
        return $policy;
    }

}