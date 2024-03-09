import { useState } from "preact/hooks"

export default function JoinNewsletter() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const handleNameChange = (event: any) => {
    setName(event.target.value)
  }

  const handleEmailChange = (event: any) => {
    setEmail(event.target.value)
  }

  return (
    <aside class="flex flex-col sm:order-1 order-2 w-full">
      <h2 class="text-white text-2xl font-bold sm:text-left text-center mt-12 mb-3">
        ¡No te pierdas ninguna novedad!
      </h2>
      <form class="flex flex-col w-full sm:justify-start justify-center sm:items-start items-center">
        <label for="name" class="text-white mt-5">Tu nombre</label>
        <input
          required
          type="text"
          id="name"
          name="name"
          class="w-80 h-12 rounded-md border-2 border-white pl-3 text-dark placeholder:text-gray-400 text-sm"
          placeholder="Jose Rodolfo Rojas"
          value={name}
          onInput={handleNameChange}
        />
        <label for="email" class="text-white mt-5">Tu correo electrónico</label>
        <input
          required
          type="email"
          id="email"
          name="email"
          class="w-80 h-12 rounded-md border-2 border-white pl-3 text-dark placeholder:text-gray-400 text-sm focus:border-secondary"
          placeholder="news@carpil.app"
          value={email}
          onInput={handleEmailChange}
        />
        <span class="text-gray-200 mt-5 text-xs sm:mx-0 mx-10 sm:text-left text-center max-w-sm"
        >Al suscribirte aceptas recibir correos electrónicos sobre noticias,
          funcionalidades y otras.</span>
        <button
          onClick={() => {
            console.log({ name, email })
          }}
          type="button"
          class="bg-dark text-white w-80 h-12 rounded-md mt-10 hover:bg-dark-light">Suscribirme</button>
      </form>
    </aside>

  )
}