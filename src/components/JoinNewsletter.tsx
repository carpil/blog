import { useForm } from "react-hook-form"
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { Toaster, toast } from "sonner"

const schema = yup.object().shape({
  name: yup.string().required('El nombre es requerido'),
  email: yup.string().email('El correo electrónico no es válido').required('El correo electrónico es requerido')
})

export default function JoinNewsletter() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(schema)
  })

  const onSubmit = async (data: {
    name: string
    email: string
  }) => {
    const response = await fetch(`/api/newsletter.json?name=${data.name}&email=${data.email}`)
    const json = await response.json() as { message?: string, error?: string, added: boolean }
    if (json.error != null) {
      toast.error('No se ha podido suscribir, inténtalo de nuevo')
      return
    }
    toast.success('¡Te has suscrito correctamente!')
  }

  return (
    <aside className="flex flex-col sm:order-1 order-2 w-full">
      <h2 className="text-white text-2xl font-bold sm:text-left text-center mt-12 mb-3">
        ¡No te pierdas ninguna novedad!
      </h2>
      <form className="flex flex-col w-full sm:justify-start justify-center sm:items-start items-center">
        <label htmlFor="name" className="text-white mt-5">Tu nombre</label>
        <input
          required
          type="text"
          id="name"
          className="w-80 h-12 rounded-md border-2 border-white pl-3 text-dark placeholder:text-gray-400 text-sm"
          placeholder="Jose Rodolfo Rojas"
          {...register('name')}
        />
        {errors.name && <span className="text-sm text-dark mt-1">{errors.name.message}</span>}
        <label htmlFor="email" className="text-white mt-5">Tu correo electrónico</label>
        <input
          required
          type="email"
          id="email"
          className="w-80 h-12 rounded-md border-2 border-white pl-3 text-dark placeholder:text-gray-400 text-sm focus:border-secondary"
          placeholder="news@carpil.app"
          {...register('email')}
        />
        {errors.email && <span className="text-sm text-dark mt-1">{errors.email.message}</span>}
        <span className="text-gray-200 mt-5 text-xs sm:mx-0 mx-10 sm:text-left text-center max-w-sm"
        >Al suscribirte aceptas recibir correos electrónicos sobre noticias,
          funcionalidades y otras.</span>
        <button
          onClick={handleSubmit(onSubmit)}
          type="button"
          className="bg-dark w-80 h-12 rounded-md mt-10 hover:bg-dark-light">
          <span className="text-white">Suscribirme</span>
        </button>
      </form>
      <Toaster position="top-center" theme="dark" />
    </aside>

  )
}