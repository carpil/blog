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
    <form class="flex flex-col">
      <h2 class="text-white text-4xl font-bold">
        ¡No te pierdas ninguna novedad!
      </h2>
      <label for="name" class="text-white mt-5">Tu nombre</label>
      <input
        required
        type="text"
        id="name"
        name="name"
        class="w-80 h-12 rounded-md border-2 border-white pl-3 text-dark placeholder:text-gray-400"
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
        class="w-80 h-12 rounded-md border-2 border-white pl-3 text-dark placeholder:text-gray-400"
        placeholder="news@carpil.app"
        value={email}
        onInput={handleEmailChange}
      />
      <span class="text-gray-200 mt-5 text-sm mr-10"
      >Al suscribirte aceptas recibir correos sobre noticias,
        funcionalidades y otras.</span>
      <button
        onClick={() => {
          console.log({ name, email })
        }}
        type="button"
        class="bg-dark text-white w-80 h-12 rounded-md mt-5 hover:bg-dark-light">Suscribirme</button>
    </form>
  )
}