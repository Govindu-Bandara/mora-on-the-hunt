import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useFetch } from '../../hooks/useFetch';
import { fetchAdmins, createAdmin, deleteAdmin, resetAdminPassword } from '../../api/authApi';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { useAuth } from '../../hooks/useAuth';

export function AdminManageAdminsPage() {
  const { admin: currentAdmin } = useAuth();
  const { data: admins, loading, refetch } = useFetch(fetchAdmins, []);
  const [resettingId, setResettingId] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  async function onSubmit(values) {
    try {
      await createAdmin(values);
      toast.success('Admin created');
      reset();
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create admin');
    }
  }

  async function handleDelete(admin) {
    if (!window.confirm(`Remove ${admin.email}?`)) return;
    try {
      await deleteAdmin(admin._id);
      toast.success('Admin removed');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove admin');
    }
  }

  async function handleResetPassword(admin) {
    if (!newPassword || newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    try {
      await resetAdminPassword(admin._id, newPassword);
      toast.success('Password reset');
      setResettingId(null);
      setNewPassword('');
    } catch {
      toast.error('Failed to reset password');
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold text-mora-white">Manage Admins</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid gap-3 rounded-xl border border-white/10 bg-white/5 p-5 sm:grid-cols-2"
      >
        <input
          placeholder="Name"
          {...register('name', { required: true })}
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-mora-white"
        />
        <input
          placeholder="Email"
          type="email"
          {...register('email', { required: true })}
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-mora-white"
        />
        <input
          placeholder="Password"
          type="password"
          {...register('password', { required: true, minLength: 8 })}
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-mora-white"
        />
        <select
          {...register('role')}
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-mora-white"
        >
          <option value="admin">Admin</option>
          <option value="superadmin">Super Admin</option>
        </select>
        {(errors.name || errors.email || errors.password) && (
          <p className="text-xs text-red-400 sm:col-span-2">All fields are required (password min 8 characters).</p>
        )}
        <Button type="submit" disabled={isSubmitting} className="sm:col-span-2">
          Create Admin
        </Button>
      </form>

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-2">
          {admins?.map((admin) => (
            <div
              key={admin._id}
              className="rounded-lg border border-white/10 bg-white/5 p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-mora-white">
                    {admin.name} <span className="text-xs text-mora-white/40">({admin.role})</span>
                  </p>
                  <p className="truncate text-xs text-mora-white/50">{admin.email}</p>
                </div>
                <div className="flex shrink-0 gap-3 text-xs">
                  <button
                    onClick={() => setResettingId(resettingId === admin._id ? null : admin._id)}
                    className="text-mora-gold hover:underline"
                  >
                    Reset Password
                  </button>
                  {admin._id !== currentAdmin?.id && (
                    <button
                      onClick={() => handleDelete(admin)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
              {resettingId === admin._id && (
                <div className="mt-3 flex gap-2">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-mora-white"
                  />
                  <Button
                    variant="outline"
                    className="px-4 py-2 text-xs"
                    onClick={() => handleResetPassword(admin)}
                  >
                    Confirm
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
