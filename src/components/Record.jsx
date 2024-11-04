import React from 'react';
import { Link } from 'react-router-dom';
import './Design.css'
const Records = ({ users, handleEdit, handleDelete, togglePopup, showPopup, isEditing, handleSubmit, handleChange, user }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-48 bg-[#1a1a1a] text-white">
        <div className="p-4">
          <h2 className="text-xl font-bold">
            Found<span className="text-red-500">IT</span>
          </h2>
        </div>
        <nav className="mt-8">
          <ul className="space-y-2">
            <li className="px-4 py-2 bg-[#2a2a2a]">
              <Link to="/" className="flex items-center">
                <span className="ml-2">User</span>
              </Link>
            </li>
            <li className="px-4 py-2 hover:bg-[#2a2a2a]">
              <Link to="/records" className="flex items-center">
                <span className="ml-2">Records</span>
              </Link>
            </li>
            <li className="px-4 py-2 hover:bg-[#2a2a2a]">
              <Link to="/points" className="flex items-center">
                <span className="ml-2">Points</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="p-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-semibold">User</h1>
                <button 
                  onClick={togglePopup}
                  className="bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold hover:bg-yellow-600"
                >
                  +
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        School Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        School ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Password
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CP
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.userID}>
                        <td className="px-6 py-4 whitespace-nowrap">{user.userID}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{user.schoolEmail}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{user.schoolId}</td>
                        <td className="px-6 py-4 whitespace-nowrap">••••••••</td>
                        <td className="px-6 py-4 whitespace-nowrap">{user.bio}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{user.currentPoints}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">{isEditing ? 'Edit User' : 'Create New User'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="text"
                  name="schoolEmail"
                  value={user.schoolEmail}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">School ID</label>
                <input
                  type="text"
                  name="schoolId"
                  value={user.schoolId}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  name="password"
                  value={user.password}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bio</label>
                <input
                  type="text"
                  name="bio"
                  value={user.bio}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Points</label>
                <input
                  type="number"
                  name="currentPoints"
                  value={user.currentPoints}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={togglePopup}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                >
                  {isEditing ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Records;