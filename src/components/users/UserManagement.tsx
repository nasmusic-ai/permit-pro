// Location: src/components/users/UserManagement.tsx
import React, { useState, useEffect } from 'react';
import { User, UserRole, Location } from '../../types';
import { getUsers, updateUserRole } from '../../lib/api'; // assume API helper functions
import './UserManagement.css';

const roles: UserRole[] = ['applicant', 'staff', 'treasurer', 'admin'];

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers(); // Fetch users from API
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, role: UserRole) => {
    try {
      await updateUserRole(userId, role);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const formatLocation = (location: Location) => {
    return `${location.barangay}, ${location.municipality}${location.city ? ', ' + location.city : ''}${location.province ? ', ' + location.province : ''}`;
  };

  if (loading) return <p>Loading users...</p>;

  return (
    <div className="user-management">
      <h2>User Management</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Location</th>
            <th>Active</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.firstName} {user.lastName}</td>
              <td>{user.email}</td>
              <td>{user.phone || '-'}</td>
              <td>
                <select
                  value={user.role}
                  onChange={e => handleRoleChange(user.id, e.target.value as UserRole)}
                >
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </td>
              <td>{user['location'] ? formatLocation(user['location'] as Location) : '-'}</td>
              <td>{user.isActive ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;