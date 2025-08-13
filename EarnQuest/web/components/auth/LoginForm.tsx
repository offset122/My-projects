'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/lib/auth-context'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { validateEmail } from '@/lib/utils'

interface LoginFormData {
  email: string
  password: string
}

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>()

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      await login(data.email, data.password)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Email Address"
        type="email"
        placeholder="your.email@example.com"
        error={errors.email?.message}
        {...register('email', {
          required: 'Email is required',
          validate: (value) => validateEmail(value) || 'Invalid email format'
        })}
      />

      <Input
        label="Password"
        type="password"
        placeholder="Enter your password"
        error={errors.password?.message}
        {...register('password', {
          required: 'Password is required',
          minLength: {
            value: 6,
            message: 'Password must be at least 6 characters'
          }
        })}
      />

      <Button
        type="submit"
        loading={isLoading}
        className="w-full"
        size="lg"
      >
        Sign In
      </Button>
    </form>
  )
}
