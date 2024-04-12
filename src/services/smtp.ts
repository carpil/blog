import { Resend } from 'resend'

const resend = new Resend(import.meta.env.RESEND_API_KEY)

export const addContact = async ({ name, email }: {
  name: string, email: string
}) => {
  const response = await resend.contacts.create({
    email: email,
    firstName: name.split(' ')[0],
    lastName: name.split(' ')[1] || '',
    unsubscribed: false,
    audienceId: import.meta.env.GENERAL_AUDIENCE_ID,
  })
  return response
}