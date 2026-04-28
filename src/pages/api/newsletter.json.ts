import type { APIRoute } from "astro";
import { addContact, getContactByEmail, updateContactSubscriptions, sendAndroidBetaEmail } from "../../services/smtp";
import { UserRole, USER_ROLES } from "../../types/user";
import type { User, UserRoleType } from "../../types/user";

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json() as User & { platform?: string }
  const isAndroid = body.platform === 'android'

  if (!body.firstName || !body.lastName || !body.email) {
    return new Response(JSON.stringify({
      error: "Completá todos los campos",
      added: false
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  if (!USER_ROLES.includes(body.role as UserRoleType)) {
    return new Response(JSON.stringify({
      error: "Seleccioná si sos pasajero o conductor",
      added: false
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const trimmedEmail = body.email.trim()
  const trimmedFirstName = body.firstName.trim()

  // Check if contact already exists
  const existingContact = await getContactByEmail(trimmedEmail)

  if (existingContact.data && existingContact.data.id) {
    await updateContactSubscriptions({
      contactId: existingContact.data.id,
      firstName: trimmedFirstName,
      lastName: body.lastName.trim(),
      role: body.role,
      weeklyUpdates: body.weeklyUpdates ?? true,
      email: trimmedEmail,
    })

    if (isAndroid) {
      sendAndroidBetaEmail({ firstName: trimmedFirstName, email: trimmedEmail })
        .catch((err) => console.error('Android beta email error:', err))
    }

    return new Response(JSON.stringify({
      message: "¡Listo! Ya estás registrado 🎉",
      added: true
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Contact doesn't exist - create new contact
  const contactResponse = await addContact({
    firstName: trimmedFirstName,
    lastName: body.lastName.trim(),
    email: trimmedEmail,
    role: body.role,
    weeklyUpdates: body.weeklyUpdates ?? true
  })

  if (contactResponse.error == null) {
    if (isAndroid) {
      sendAndroidBetaEmail({ firstName: trimmedFirstName, email: trimmedEmail })
        .catch((err) => console.error('Android beta email error:', err))
    }
  }

  if (contactResponse.error != null) {
    const errorMessage = contactResponse.error.message || 'Error al agregar el contacto'

    console.error('Resend error:', {
      message: errorMessage,
      error: contactResponse.error,
      email: body.email.trim()
    })

    if (errorMessage.toLowerCase().includes('already exists') ||
      errorMessage.toLowerCase().includes('duplicate') ||
      errorMessage.toLowerCase().includes('ya existe') ||
      errorMessage.toLowerCase().includes('contact already')) {
      return new Response(JSON.stringify({
        error: "Ya estás en la lista 🎉",
        added: false
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({
      error: errorMessage || "Algo salió mal. Intentá de nuevo",
      added: false
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({
    message: "¡Listo! Ya estás registrado 🎉",
    added: true
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}