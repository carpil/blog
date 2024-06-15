import type { APIRoute } from "astro";
import { addContact, sendWelcomeEmail } from "../../services/smtp";

export const GET: APIRoute = async ({ request }) => {
  const { url } = request
  const searchParams = new URL(url).searchParams
  const name = searchParams.get('name')
  const email = searchParams.get('email')

  if (name == null || email == null) {
    return new Response(JSON.stringify({
      error: "No name or email was provided!",
      added: false
    }))
  }

  const response = await addContact({ name, email })
  if (response.error != null) {
    return new Response(JSON.stringify({
      error: response.error.message,
      added: false
    }))
  }
  const welcomeEmailResponse = await sendWelcomeEmail({ name, email })
  if (welcomeEmailResponse.error != null) {
    return new Response(JSON.stringify({
      error: welcomeEmailResponse.error.message,
      added: false
    }))
  }

  return new Response(JSON.stringify({
    message: "User added to the newsletter!",
    added: true
  })
  )
}