import { useState } from "react"
import { Toaster, toast } from "sonner"
import { useForm } from "react-hook-form"
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { UserRole, USER_ROLES } from "../types/user"
import type { User, UserRoleType } from "../types/user"

const schema = yup.object({
  firstName: yup
    .string()
    .required('El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(30, 'El nombre no puede tener más de 30 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
  lastName: yup
    .string()
    .required('El apellido es requerido')
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(30, 'El apellido no puede tener más de 30 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El apellido solo puede contener letras y espacios'),
  email: yup
    .string()
    .required('El correo electrónico es requerido')
    .email('El correo electrónico no es válido')
    .max(50, 'El correo no puede tener más de 50 caracteres'),
  role: yup.string().oneOf(USER_ROLES as readonly string[]).required(),
  weeklyUpdates: yup.boolean().default(true)
})

type FormData = yup.InferType<typeof schema>

export default function JoinNewsletter() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [selectedRole, setSelectedRole] = useState<UserRoleType>(UserRole.PASSENGER)
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      weeklyUpdates: true
    }
  })

  const hasErrors = Object.keys(errors).length > 0

  const handleRoleSelect = (role: UserRoleType) => {
    setSelectedRole(role)
    setValue('role', role, { shouldValidate: true })
  }

  const onSubmit = async (data: FormData) => {
    setStatus('loading')
    try {
      const response = await fetch('/api/newsletter.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          email: data.email.trim(),
          role: data.role,
          weeklyUpdates: data.weeklyUpdates ?? true
        } as User)
      })

      const json = await response.json() as { message?: string, error?: string, added: boolean }

      if (!response.ok || json.error != null || !json.added) {
        setStatus('error')
        toast.error(json.error || 'Algo salió mal. Intentá de nuevo')
        return
      }

      setStatus('success')
      toast.success(json.message || '¡Listo! Ya estás registrado 🎉')

      sessionStorage.setItem('carpil_name', data.firstName.trim())
      sessionStorage.setItem('carpil_email', data.email.trim())

      setTimeout(() => {
        window.location.href = '/confirmacion'
      }, 1500)
      
      reset({
        firstName: '',
        lastName: '',
        email: '',
        role: UserRole.PASSENGER,
        weeklyUpdates: true
      })
      setSelectedRole(UserRole.PASSENGER)
    } catch (error) {
      setStatus('error')
      console.error('Error al suscribirse:', error)
      toast.error('Algo salió mal. Intentá de nuevo')
    }

  }

  const errorFirstName = errors.firstName?.message
  const errorLastName = errors.lastName?.message
  const errorEmail = errors.email?.message

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-white rounded-xl p-6 sm:p-8 shadow-md border border-gray-100">
        <h2 className="font-heading text-xl lg:text-2xl font-bold text-dark text-center mb-8">
          Sé de los primeros en usar Carpil
        </h2>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col w-full gap-5"
        >
          <div className="flex flex-col gap-2">
            <div className="flex gap-3">
              <div className="flex-1 flex flex-col gap-2">
                <label htmlFor="firstName" className="font-body text-sm font-medium text-dark">
                  Nombre
                </label>
                <input
                  id="firstName"
                  type="text"
                  {...register('firstName')}
                  className={`w-full min-h-[44px] px-4 rounded-lg border-2 bg-white text-dark placeholder:text-gray-400 focus:outline-none transition-colors ${errors.firstName
                    ? 'border-red-500 focus:border-red-600'
                    : 'border-gray-200 focus:border-primary'
                    }`}
                  placeholder="Ej: María"
                />
                {errorFirstName && <span className="text-sm text-red-600 mt-1" role="alert">{errorFirstName}</span>}
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <label htmlFor="lastName" className="font-body text-sm font-medium text-dark">
                  Apellido
                </label>
                <input
                  id="lastName"
                  type="text"
                  {...register('lastName')}
                  className={`w-full min-h-[44px] px-4 rounded-lg border-2 bg-white text-dark placeholder:text-gray-400 focus:outline-none transition-colors ${errors.lastName
                    ? 'border-red-500 focus:border-red-600'
                    : 'border-gray-200 focus:border-primary'
                    }`}
                  placeholder="Ej: González"
                />
                {errorLastName && <span className="text-sm text-red-600 mt-1" role="alert">{errorLastName}</span>}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="font-body text-sm font-medium text-dark">
              Tu correo
            </label>
            <input
              type="email"
              id="email"
              {...register('email')}
              className={`w-full min-h-[44px] px-4 rounded-lg border-2 bg-white text-dark placeholder:text-gray-400 focus:outline-none transition-colors ${errorEmail ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-primary'}`}
              placeholder="Ej: maria.gonzalez@email.com"
            />
            {errorEmail && <span className="text-sm text-red-600 mt-1" role="alert">{errorEmail}</span>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-body text-sm font-medium text-dark">
              ¿Cómo querés usar Carpil?
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleRoleSelect(UserRole.PASSENGER)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-heading font-medium text-sm transition-all min-h-[48px] ${selectedRole === UserRole.PASSENGER
                  ? 'bg-white border-2 border-primary text-primary shadow-sm'
                  : 'bg-white border-2 border-gray-200 text-dark hover:border-gray-300 hover:bg-gray-50'
                  }`}
              >
                <span className="text-lg">👤</span>
                <span>Pasajero</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect(UserRole.DRIVER)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-heading font-medium text-sm transition-all min-h-[48px] ${selectedRole === UserRole.DRIVER
                  ? 'bg-white border-2 border-primary text-primary shadow-sm'
                  : 'bg-white border-2 border-gray-200 text-dark hover:border-gray-300 hover:bg-gray-50'
                  }`}
              >
                <span className="text-lg">🚗</span>
                <span>Conductor</span>
              </button>
            </div>
            <input type="hidden" {...register('role')} value={selectedRole} />
            {errors.role && (
              <span className="text-sm text-red-600 mt-1" role="alert">
                {errors.role.message}
              </span>
            )}
          </div>

          <div className="flex gap-3 items-center">
            <input
              type="checkbox"
              id="weeklyUpdates"
              {...register('weeklyUpdates')}
              className="mt-1 w-5 h-5 rounded border-2 border-gray-300 text-primary bg-white checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 cursor-pointer accent-primary"
            />
            <label htmlFor="weeklyUpdates" className="font-body text-sm text-dark cursor-pointer text-center">
              Avisame del progreso cada semana
            </label>
          </div>

          <button
            type="submit"
            disabled={status === 'loading' || hasErrors}
            className="w-full min-h-[48px] px-6 py-3 bg-primary text-white rounded-lg font-heading font-bold text-base hover:bg-[#5A3FD9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {status === 'loading' ? 'Enviando...' : 'Unirme a la waitlist'}
          </button>
        </form>
      </div>
      <Toaster position="top-center" theme="light" />
    </div>
  )
}
