import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function ManageSalaries() {
    const [salaries, setSalaries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch salaries from API
    const fetchSalaries = () => {
        axios.get('/salaries')
            .then(response => {
                setSalaries(response.data);
            })
            .catch(error => {
                console.error('Error fetching salaries:', error);
                setError('Something went wrong while fetching salaries.');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchSalaries();
    }, []);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Salaries
                </h2>
            }
        >
            <Head title="Salaries" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h3 className="text-lg font-bold mb-4">Manage all salaries paid and pending</h3>

                            {loading && <p className="text-blue-600">Loading salaries...</p>}
                            {error && <p className="text-red-600">{error}</p>}

                            {!loading && !error && (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full border border-gray-200">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="border px-4 py-2 text-left">Employee</th>
                                                <th className="border px-4 py-2 text-left">Amount</th>
                                                <th className="border px-4 py-2 text-left">Status</th>
                                                <th className="border px-4 py-2 text-left">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {salaries.map((salary) => (
                                                <tr key={salary.id}>
                                                    <td className="border px-4 py-2">{salary.user?.name ?? 'N/A'}</td>
                                                    <td className="border px-4 py-2">{salary.amount}</td>
                                                    <td className={`border px-4 py-2 ${salary.status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                                                        {salary.status}
                                                    </td>
                                                    <td className="border px-4 py-2">{salary.date}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
