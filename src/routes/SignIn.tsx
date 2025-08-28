import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useToast } from "../components/Toast";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const toast = useToast();

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) toast(error.message, "error");
    else toast("Check your email for the magic link!", "success");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="card max-w-md w-full">
        <div className="card-header">
          <h1 className="h1">Sign In to LeaveHub</h1>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="input"
              />
            </div>
            <button onClick={handleSignIn} className="btn-primary w-full">
              Send Magic Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}