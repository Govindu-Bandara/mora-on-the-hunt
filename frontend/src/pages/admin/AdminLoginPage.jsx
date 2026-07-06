import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';

export function AdminLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  async function onSubmit(values) {
    setSubmitting(true);
    try {
      await login(values.email, values.password, values.rememberMe);
      navigate('/admin/dashboard');
    } catch {
      toast.error('Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-mora-black px-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8"
      >
        <h1 className="font-slogan mb-6 text-center text-xl text-mora-gold">#MORA Admin</h1>

        <label htmlFor="email" className="mb-1 block text-sm text-mora-white/70">
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register('email', { required: 'Email is required' })}
          className="mb-1 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-mora-white focus:border-mora-gold focus:outline-none"
        />
        {errors.email && <p className="mb-2 text-xs text-red-400">{errors.email.message}</p>}

        <label htmlFor="password" className="mb-1 mt-3 block text-sm text-mora-white/70">
          Password
        </label>
        <input
          id="password"
          type="password"
          {...register('password', { required: 'Password is required' })}
          className="mb-1 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-mora-white focus:border-mora-gold focus:outline-none"
        />
        {errors.password && <p className="mb-2 text-xs text-red-400">{errors.password.message}</p>}

        <label className="mt-3 mb-6 flex items-center gap-2 text-sm text-mora-white/60">
          <input type="checkbox" {...register('rememberMe')} className="accent-mora-gold" />
          Remember me
        </label>

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? 'Logging in...' : 'Log In'}
        </Button>
      </form>
    </div>
  );
}
