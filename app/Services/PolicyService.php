<?php

namespace App\Services;

use App\Models\User;
use App\Models\HrPolicy;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class PolicyService
{
    /**
     * Retrieve all policies with uploader information
     *
     * @return \Illuminate\Database\Eloquent\Collection
     * @throws \Exception
     */
    public function getPolicies()
    {
        try {
            return HrPolicy::with('uploader:id,name')->latest()->get();
        } catch (\Exception $e) {
            Log::error('Error fetching policies: ' . $e->getMessage());
            throw new \Exception('Failed to retrieve policies. Please try again later.');
        }
    }

    /**
     * Store a new policy with file upload
     *
     * @param array $data
     * @return HrPolicy
     * @throws ValidationException
     */
    public function storePolicies($data)
    {
        try {
            // Validate input data
            $this->validatePolicyData($data);

            // Handle file upload
            if (!isset($data['file']) || !$data['file']->isValid()) {
                throw ValidationException::withMessages([
                    'file' => 'Please upload a valid file.'
                ]);
            }

            $path = $data['file']->store('policies', 'public');

            return HrPolicy::create([
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'file_path' => $path,
                'uploaded_by' => auth()->id() ?? throw new \Exception('User not authenticated.')
            ]);

        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::error('Error storing policy: ' . $e->getMessage());
            throw new \Exception('Failed to store policy. Please try again.');
        }
    }

    /**
     * View a specific policy document
     *
     * @param int $id
     * @return HrPolicy
     * @throws ModelNotFoundException
     */
    public function viewDoc($id)
    {
        try {
            $policy = HrPolicy::findOrFail($id);

            // Verify file exists in storage
            if (!Storage::disk('public')->exists($policy->file_path)) {
                throw new \Exception('Policy document file not found.');
            }

            return $policy;
        } catch (ModelNotFoundException $e) {
            throw new ModelNotFoundException('Policy not found.');
        } catch (\Exception $e) {
            Log::error('Error viewing policy document: ' . $e->getMessage());
            throw new \Exception('Failed to retrieve policy document. Please try again.');
        }
    }

    /**
     * Validate policy data
     *
     * @param array $data
     * @throws ValidationException
     */
    private function validatePolicyData($data)
    {
        $validator = \Validator::make($data, [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'file' => 'required|file|mimes:pdf,doc,docx|max:10000', // 10MB max
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
    }


    /**
 * Delete a policy and its associated file
 *
 * @param int $id
 * @throws \Exception
 */
public function deletePolicy($id)
{
    try {
        $policy = HrPolicy::findOrFail($id);

        // Delete the file if it exists
        if ($policy->file_path && Storage::disk('public')->exists($policy->file_path)) {
            Storage::disk('public')->delete($policy->file_path);
        }

        // Delete the policy record
        $policy->delete();
    } catch (ModelNotFoundException $e) {
        throw new \Exception('Policy not found.');
    } catch (\Exception $e) {
        Log::error('Error deleting policy: ' . $e->getMessage());
        throw new \Exception('Failed to delete policy. Please try again.');
    }
}

}
