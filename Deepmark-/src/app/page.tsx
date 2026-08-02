import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-violet-600 flex items-center justify-center">
              <span className="text-lg font-bold text-white">D</span>
            </div>
            <span className="text-2xl font-bold text-black">DeepMark</span>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-lg text-gray-500 mb-8">
          Marketing that works, while you do.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-4">
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center h-11 px-6 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="inline-flex items-center justify-center h-11 px-6 bg-white border border-gray-300 hover:bg-gray-50 text-black font-medium rounded-lg transition-colors"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
