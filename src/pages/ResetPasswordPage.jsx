import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';


const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token'); // Extract token from query parameter

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isValidToken, setIsValidToken] = useState(false);
    const [email, setEmail] = useState('');

    // Verify token on component mount
    useEffect(() => {
        if (token) {
            verifyToken();
        } else {
            setError('Invalid or missing token');
        }
    }, [token]);

    const verifyToken = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/connectDB?type=verify-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Invalid or expired token');
            }

            setIsValidToken(true);
            setEmail(data.email); // Store email for display
        } catch (err) {
            setError(err.message || 'Error verifying token');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/connectDB?type=reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, newPassword }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to reset password');
            }

            setMessage('Password reset successfully! Redirecting to login...');

            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.message || 'An error occurred');
            console.error('Reset password error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isValidToken && error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-full h-[2rem] bg-blue mb-4 absolute top-0"></div>
                <div className="w-full max-w-md p-6 space-y-8 bg-white shadow-lg">
                    <div className="text-center">
                        <h2 className="mt-6 text-3xl font-bold text-gray-900">Invalid Token</h2>
                    </div>

                    <div className="bg-red-50 border-l-4 border-red-500 p-4">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>

                    <div className="text-center text-sm text-gray-600">
                        <Link to="/forgot-password" className="font-medium text-blue hover:text-light-blue">
                            Request a new reset link
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full h-[2rem] bg-blue mb-4 absolute top-0"></div>
            <div className="w-full max-w-md p-6 space-y-8 bg-white shadow-lg">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">Reset Password</h2>
                    {email && (
                        <p className="mt-2 text-sm text-gray-600">
                            For: {email}
                        </p>
                    )}
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {message && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-4">
                        <p className="text-sm text-green-700">{message}</p>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                                New Password
                            </label>
                            <input
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Enter new password (min 8 characters)"
                                minLength="8"
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Confirm new password"
                                minLength="8"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading || !isValidToken}
                            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue hover:bg-dark-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading || !isValidToken ? 'opacity-75 cursor-not-allowed' : ''
                                }`}
                        >
                            {isLoading ? 'Processing...' : 'Reset Password'}
                        </button>
                    </div>
                </form>

                <div className="text-center text-sm text-gray-600">
                    Remembered your password?{' '}
                    <Link to="/login" className="font-medium text-blue hover:text-light-blue">
                        Sign in here
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;