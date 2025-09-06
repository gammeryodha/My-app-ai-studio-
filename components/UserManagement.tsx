
import React, { useState } from 'react';
import type { User, UserProfile } from '../types';

interface UserManagementProps {
    currentUser: UserProfile;
    users: User[];
    onAddUser: (user: User) => void;
    onUpdateUser: (username: string, updatedUser: User) => void;
    onDeleteUser: (username: string) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ currentUser, users, onAddUser, onUpdateUser, onDeleteUser }) => {
    // State for creating a new user
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState<'admin' | 'user'>('user');
    
    // State for editing an existing user
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [editUsername, setEditUsername] = useState('');
    const [editPassword, setEditPassword] = useState('');
    const [editRole, setEditRole] = useState<'admin' | 'user'>('user');

    const [error, setError] = useState<string | null>(null);

    const handleCreateUser = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!newUsername.trim() || !newPassword.trim()) {
            setError("Username and password cannot be empty.");
            return;
        }
        try {
            onAddUser({ username: newUsername, password: newPassword, role: newRole });
            setNewUsername('');
            setNewPassword('');
            setNewRole('user');
        } catch (err: any) {
            setError(err.message);
        }
    };

    const startEditing = (user: User) => {
        setEditingUserId(user.username);
        setEditUsername(user.username);
        setEditPassword(''); // Clear password field for security
        setEditRole(user.role);
    };
    
    const cancelEditing = () => {
        setEditingUserId(null);
        setEditUsername('');
        setEditPassword('');
        setEditRole('user');
        setError(null);
    };

    const handleUpdateUser = (originalUsername: string) => {
        setError(null);
        if (!editUsername.trim()) {
            setError("Username cannot be empty.");
            return;
        }
        
        if (originalUsername !== editUsername && users.some(u => u.username === editUsername)) {
            setError("This username is already taken.");
            return;
        }

        // Prevent last admin from losing admin rights
        const admins = users.filter(u => u.role === 'admin');
        const isLastAdmin = admins.length === 1 && admins[0].username === originalUsername;
        if (isLastAdmin && editRole === 'user') {
            setError("Cannot remove admin role from the last admin user.");
            return;
        }

        const updatedUser: Partial<User> & { username: string; role: 'admin' | 'user'; } = { 
            username: editUsername, 
            role: editRole 
        };
        if (editPassword.trim()) {
            updatedUser.password = editPassword;
        }

        onUpdateUser(originalUsername, updatedUser as User);
        cancelEditing();
    };

    const handleDeleteUser = (username: string) => {
        const userToDelete = users.find(u => u.username === username);
        if (!userToDelete) return;

        if (username === currentUser.username) {
            alert("You cannot delete your own account.");
            return;
        }

        // Prevent deleting the last admin
        const admins = users.filter(u => u.role === 'admin');
        if (userToDelete.role === 'admin' && admins.length <= 1) {
            alert("You cannot delete the last admin account.");
            return;
        }

        if (window.confirm(`Are you sure you want to delete the user "${username}"? This action cannot be undone.`)) {
            onDeleteUser(username);
        }
    };


    return (
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl shadow-2xl shadow-indigo-500/10 p-6 md:p-10 border border-gray-800">
            <h2 className="text-3xl font-bold mb-6 text-indigo-300">User Management</h2>

            <div className="mb-8 p-4 bg-gray-800/60 rounded-lg border border-gray-700">
                <h3 className="text-xl font-semibold mb-4 text-white">Create New User</h3>
                <form onSubmit={handleCreateUser} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="new-username" className="block text-sm font-medium text-gray-300">Username</label>
                            <input type="text" id="new-username" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className="mt-1 block w-full bg-gray-900 border-2 border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="new-password"className="block text-sm font-medium text-gray-300">Password</label>
                            <input type="password" id="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-1 block w-full bg-gray-900 border-2 border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="new-role"className="block text-sm font-medium text-gray-300">Role</label>
                            <select id="new-role" value={newRole} onChange={e => setNewRole(e.target.value as 'admin' | 'user')} className="mt-1 block w-full bg-gray-900 border-2 border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">Add User</button>
                </form>
            </div>

            <div>
                <h3 className="text-xl font-semibold mb-4 text-white">Existing Users</h3>
                <div className="space-y-3">
                    {users.map(user => (
                        <div key={user.username} className="bg-gray-800/60 p-3 rounded-lg border border-gray-700">
                            {editingUserId === user.username ? (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <input type="text" value={editUsername} onChange={e => setEditUsername(e.target.value)} className="w-full bg-gray-900 border-2 border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                        <input type="password" placeholder="New Password (optional)" value={editPassword} onChange={e => setEditPassword(e.target.value)} className="w-full bg-gray-900 border-2 border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                        <select value={editRole} onChange={e => setEditRole(e.target.value as 'admin' | 'user')} className="w-full bg-gray-900 border-2 border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleUpdateUser(user.username)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded-md text-sm">Save</button>
                                        <button onClick={cancelEditing} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-3 rounded-md text-sm">Cancel</button>
                                    </div>
                                    {error && editingUserId === user.username && <p className="text-red-400 text-sm mt-2">{error}</p>}
                                </div>
                            ) : (
                                <div className="flex justify-between items-center">
                                    <div>
                                        <span className="font-medium text-white">{user.username} {user.username === currentUser.username && <span className="text-xs text-indigo-400">(You)</span>}</span>
                                        <span className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded-full ${user.role === 'admin' ? 'bg-purple-600 text-purple-100' : 'bg-gray-600 text-gray-200'}`}>
                                            {user.role}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => startEditing(user)} className="text-sm bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded-md transition-colors">Edit</button>
                                        <button onClick={() => handleDeleteUser(user.username)} disabled={user.username === currentUser.username} className="text-sm bg-red-800 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Delete</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UserManagement;