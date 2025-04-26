import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Account = () => {
  const { user, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setMessage({ text: 'New passwords do not match', type: 'error' });
      return;
    }

    try {
      const response = await fetch('/api/connectdb?type=updateUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user._id,
          name: formData.name,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      updateUser({ name: formData.name }); // Update context
      
      setMessage({ text: 'Profile updated successfully', type: 'success' });
      setIsEditing(false);
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-beige">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-blue mb-2">MY ACCOUNT</h1>
          <div className="w-20 h-1 bg-orange mx-auto"></div>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message.text}
          </div>
        )}

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-blue">Personal Information</h2>
              {!isEditing && user.role !== 'admin' && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-orange hover:text-dark-orange text-sm font-medium"
                >
                  Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-blue text-sm font-medium mb-2" htmlFor="name">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing || user.role === 'admin'}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange"
                />
              </div>

              <div className="mb-4">
                <label className="block text-blue text-sm font-medium mb-2" htmlFor="email">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100"
                />
              </div>

              {isEditing && user.role !== 'admin' && (
                <>
                  <div className="mb-4">
                    <label className="block text-blue text-sm font-medium mb-2" htmlFor="currentPassword">
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-blue text-sm font-medium mb-2" htmlFor="newPassword">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-blue text-sm font-medium mb-2" htmlFor="confirmPassword">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange"
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setMessage({ text: '', type: '' });
                      }}
                      className="px-4 py-2 border border-gray-300 text-blue rounded hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-orange text-white rounded hover:bg-dark-orange"
                    >
                      Save Changes
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>

        {user.role !== 'admin' && (
          <div className="mt-8 bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-blue mb-6">Order History</h2>
              <button
                onClick={() => navigate('/orders')}
                className="text-orange hover:text-dark-orange text-sm font-medium"
              >
                View all orders
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Account;