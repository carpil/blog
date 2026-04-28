import { useState } from "react"
import { useForm } from "react-hook-form"
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { UserRole, USER_ROLES } from "../types/user"
import type { UserRoleType } from "../types/user"

const schema = yup.object({
  firstName: yup.string().required('Nombre requerido').min(2, 'Mínimo 2 caracteres').max(30).matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo letras'),
  lastName: yup.string().required('Apellido requerido').min(2, 'Mínimo 2 caracteres').max(30).matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo letras'),
  email: yup.string().required('Correo requerido').email('Correo inválido').max(50),
  role: yup.string().oneOf(USER_ROLES as readonly string[]).required(),
})

type FormData = yup.InferType<typeof schema>

export default function AndroidBetaModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [success, setSuccess] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [selectedRole, setSelectedRole] = useState<UserRoleType>(UserRole.PASSENGER)

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<FormData>({
    resolver: yupResolver(schema),
  })

  const handleRoleSelect = (role: UserRoleType) => {
    setSelectedRole(role)
    setValue('role', role, { shouldValidate: true })
  }

  const onSubmit = async (data: FormData) => {
    setSubmitStatus('loading')
    setErrorMsg('')
    try {
      const response = await fetch('/api/newsletter.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          email: data.email.trim(),
          role: data.role,
          weeklyUpdates: true,
          platform: 'android',
        }),
      })
      const json = await response.json() as { message?: string, error?: string, added: boolean }

      if (!response.ok || json.error != null) {
        setSubmitStatus('error')
        setErrorMsg(json.error || 'Algo salió mal. Intentá de nuevo')
        return
      }

      setSuccess(true)
    } catch {
      setSubmitStatus('error')
      setErrorMsg('Algo salió mal. Intentá de nuevo')
    }
  }

  const open = () => setIsOpen(true)
  const close = () => {
    setIsOpen(false)
    setTimeout(() => {
      setSuccess(false)
      setSubmitStatus('idle')
      setErrorMsg('')
      reset()
      setSelectedRole(UserRole.PASSENGER)
    }, 300)
  }

  return (
    <>
      <button
        onClick={open}
        className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 bg-black border-2 border-black rounded-lg hover:bg-gray-800 transition-colors min-w-[140px] sm:min-w-[160px]"
      >
        <svg className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
        </svg>
        <div className="text-left">
          <div className="font-body text-xs text-gray-300">Beta disponible</div>
          <div className="font-heading text-sm font-bold text-white">Google Play</div>
        </div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />

          <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-primary px-6 pt-6 pb-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-white/70" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                  </svg>
                  <span className="font-body text-xs text-white/70 font-semibold tracking-widest uppercase">Beta · Android</span>
                </div>
                <button onClick={close} className="text-white/60 hover:text-white transition-colors p-1 rounded">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <h2 className="font-heading text-xl font-bold text-white">Accedé a la Beta de Android</h2>
              <p className="font-body text-sm text-white/60 mt-1">Registrate y te mandamos el link de instalación al instante</p>
            </div>

            <div className="px-6 py-6">
              {success ? (
                <div className="text-center py-2">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-full mb-4">
                    <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-dark mb-2">¡Listo! Revisá tu correo</h3>
                  <p className="font-body text-sm text-gray-500 mb-6">Te mandamos los pasos para instalar Carpil en tu Android.</p>
                  <button
                    onClick={close}
                    className="w-full min-h-[48px] px-6 py-3 bg-primary text-white rounded-lg font-heading font-bold text-sm hover:bg-[#5A3FD9] transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
                  <div className="flex gap-3">
                    <div className="flex-1 flex flex-col gap-1.5">
                      <label className="font-body text-sm font-medium text-dark">Nombre</label>
                      <input
                        {...register('firstName')}
                        type="text"
                        placeholder="María"
                        className={`w-full min-h-[44px] px-4 rounded-lg border-2 bg-white text-dark placeholder:text-gray-400 focus:outline-none transition-colors ${errors.firstName ? 'border-red-500' : 'border-gray-200 focus:border-primary'}`}
                      />
                      {errors.firstName && <span className="text-xs text-red-600">{errors.firstName.message}</span>}
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5">
                      <label className="font-body text-sm font-medium text-dark">Apellido</label>
                      <input
                        {...register('lastName')}
                        type="text"
                        placeholder="González"
                        className={`w-full min-h-[44px] px-4 rounded-lg border-2 bg-white text-dark placeholder:text-gray-400 focus:outline-none transition-colors ${errors.lastName ? 'border-red-500' : 'border-gray-200 focus:border-primary'}`}
                      />
                      {errors.lastName && <span className="text-xs text-red-600">{errors.lastName.message}</span>}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-body text-sm font-medium text-dark">Tu correo</label>
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="maria@email.com"
                      className={`w-full min-h-[44px] px-4 rounded-lg border-2 bg-white text-dark placeholder:text-gray-400 focus:outline-none transition-colors ${errors.email ? 'border-red-500' : 'border-gray-200 focus:border-primary'}`}
                    />
                    {errors.email && <span className="text-xs text-red-600">{errors.email.message}</span>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-body text-sm font-medium text-dark">¿Cómo vas a usar Carpil?</label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleRoleSelect(UserRole.PASSENGER)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-heading font-medium text-sm transition-all min-h-[44px] ${selectedRole === UserRole.PASSENGER ? 'bg-white border-2 border-primary text-primary shadow-sm' : 'bg-white border-2 border-gray-200 text-dark hover:border-gray-300 hover:bg-gray-50'}`}
                      >
                        <span>👤</span> Pasajero
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRoleSelect(UserRole.DRIVER)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-heading font-medium text-sm transition-all min-h-[44px] ${selectedRole === UserRole.DRIVER ? 'bg-white border-2 border-primary text-primary shadow-sm' : 'bg-white border-2 border-gray-200 text-dark hover:border-gray-300 hover:bg-gray-50'}`}
                      >
                        <span>🚗</span> Conductor
                      </button>
                    </div>
                    <input type="hidden" {...register('role')} value={selectedRole} />
                  </div>

                  {submitStatus === 'error' && (
                    <p className="text-sm text-red-600 text-center">{errorMsg}</p>
                  )}

                  <button
                    type="submit"
                    disabled={submitStatus === 'loading'}
                    className="w-full min-h-[48px] px-6 py-3 bg-primary text-white rounded-lg font-heading font-bold text-base hover:bg-[#5A3FD9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  >
                    {submitStatus === 'loading' ? 'Enviando...' : 'Acceder a la Beta'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
