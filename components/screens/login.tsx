"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Lock, User } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch("/api/auth/sign-in/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: username,
          password,
        }),
      });

      if (res.ok) {
        // Redirect to home page, which will check role and redirect accordingly
        router.push("/");
      } else {
        const data = await res.json();
        setError(data.message || "Invalid credentials");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-linear-to-br from-primary/5 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
            <ShoppingCart className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="mb-2">Yenpoobi POS System</h1>
          <p className="text-muted-foreground">Sign in to continue</p>
        </div>

        {/* Login Form */}
        <div className="bg-card border border-border rounded-2xl shadow-lg p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block mb-3">Login As</label>
              <div className="grid grid-cols-3 gap-3">
                {/* <button
                  type="button"
                  onClick={() => setRole('cashier')}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    role === 'cashier'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background hover:border-primary/50'
                  }`}
                >
                  Cashier
                </button>
                <button
                  type="button"
                  onClick={() => setRole('manager')}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    role === 'manager'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background hover:border-primary/50'
                  }`}
                >
                  Manager
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    role === 'admin'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background hover:border-primary/50'
                  }`}
                >
                  Admin
                </button> */}
              </div>
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full pl-11 pr-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-11 pr-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          
          
        </div>
      </div>
    </div>
  );
}
