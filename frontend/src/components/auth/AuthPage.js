"use client"

import { useState } from "react"
import LoginForm from "./LoginForm"
import RegisterForm from "./RegisterForm"

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md">
        <div className="card">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-pink-600 mb-2">Tag Me! 💖</h1>
            <p className="text-gray-600">The cutest tag game ever!</p>
          </div>

          {isLogin ? <LoginForm /> : <RegisterForm />}

          <div className="text-center mt-6">
            <button onClick={() => setIsLogin(!isLogin)} className="text-pink-600 hover:text-pink-700 font-semibold">
              {isLogin ? "Need an account? Sign up!" : "Already have an account? Sign in!"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthPage
