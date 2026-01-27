import { Resend, type CreateContactOptions } from 'resend'
import type { User } from '../types/user'

// ============================================================================
// Constants & Config
// ============================================================================

const resend = new Resend(import.meta.env.RESEND_API_KEY)

const config = {
  segments: {
    general: import.meta.env.GENERAL_SEGMENT_ID,
    weeklyUpdates: import.meta.env.WEEKLY_UPDATES_SEGMENT_ID,
  },
  topics: {
    weeklyUpdates: import.meta.env.WEEKLY_UPDATES_TOPIC_ID,
  },
} as const

// ============================================================================
// Type Definitions
// ============================================================================

interface SendWelcomeEmailParams {
  firstName: string
  email: string
}

interface SegmentsAndTopics {
  segments: string[]
  topics: string[]
}

// ============================================================================
// Helper Functions (Private)
// ============================================================================

const isValidUUID = (str: string | undefined): boolean => {
  if (!str) return false
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

const buildSegmentsAndTopics = (weeklyUpdates: boolean): SegmentsAndTopics => {
  const segments: string[] = []
  const topics: string[] = []

  if (isValidUUID(config.segments.general)) {
    segments.push(config.segments.general)
  }

  if (weeklyUpdates && isValidUUID(config.segments.weeklyUpdates)) {
    segments.push(config.segments.weeklyUpdates)
  }

  if (weeklyUpdates && isValidUUID(config.topics.weeklyUpdates)) {
    topics.push(config.topics.weeklyUpdates)
  }

  return { segments, topics }
}

const addContactToSegments = async (contactId: string, segmentIds: string[]): Promise<void> => {
  for (const segmentId of segmentIds) {
    if (!isValidUUID(segmentId)) continue

    try {
      // Resend API accepts contactId (not id) or email
      const response = await resend.contacts.segments.add({
        contactId: contactId,
        segmentId: segmentId,
      })

      if (response.error) {
        console.error('addContactToSegments error:', {
          error: response.error,
          contactId,
          segmentId,
        })
      }
    } catch (error) {
      console.error('addContactToSegments error:', {
        error,
        contactId,
        segmentId,
      })
    }
  }
}

const addContactToTopics = async (contactId: string, topicIds: string[]): Promise<void> => {
  const validTopics = topicIds
    .filter((topicId) => isValidUUID(topicId))
    .map((topicId) => ({
      id: topicId,
      subscription: 'opt_in' as const,
    }))

  if (validTopics.length === 0) {
    return
  }

  try {
    const response = await resend.contacts.topics.update({
      id: contactId,
      topics: validTopics,
    })

    if (response.error) {
      console.error('addContactToTopics error:', {
        error: response.error,
        contactId,
        topicIds,
      })
    }
  } catch (error) {
    console.error('addContactToTopics error:', {
      error,
      contactId,
      topicIds,
    })
  }
}

// ============================================================================
// Public API Functions
// ============================================================================

export const checkContactExists = async (email: string): Promise<boolean> => {
  try {
    const response = await resend.contacts.get({
      email: email,
    })
    return response.data !== null && response.error === null
  } catch {
    return false
  }
}

export const getContactByEmail = async (email: string) => {
  try {
    const response = await resend.contacts.get({
      email: email,
    })
    if (response.data && response.error === null) {
      return { data: response.data, error: null }
    }
    return { data: null, error: response.error }
  } catch (error) {
    return { data: null, error }
  }
}

export const addContact = async ({ firstName, lastName, email, role, weeklyUpdates }: User) => {
  const { segments, topics } = buildSegmentsAndTopics(weeklyUpdates)

  const contactData: CreateContactOptions = {
    email,
    firstName,
    lastName,
    unsubscribed: false,
    properties: {
      role: role,
    },
  }

  const createResponse = await resend.contacts.create(contactData)

  if (createResponse.error != null) {
    return createResponse
  }

  // Extract contact ID from the response
  const contactId = createResponse.data?.id

  if (!contactId) {
    return createResponse
  }

  // Use the contact ID for segments and topics
  if (segments.length > 0) {
    await addContactToSegments(contactId, segments)
  }

  if (topics.length > 0) {
    await addContactToTopics(contactId, topics)
  }

  // Send welcome email after adding contact and assigning to segments/topics
  await sendWelcomeEmail({ firstName, email })

  return createResponse
}

const updateContactDetails = async ({
  contactId,
  firstName,
  lastName,
  role,
}: {
  contactId: string
  firstName: string
  lastName: string
  role: string
}): Promise<void> => {
  try {
    const response = await resend.contacts.update({
      id: contactId,
      firstName,
      lastName,
      properties: {
        role: role,
      },
    })

    if (response.error) {
      console.error('updateContactDetails error:', {
        error: response.error,
        contactId,
        firstName,
        lastName,
        role,
      })
    }
  } catch (error) {
    console.error('updateContactDetails error:', {
      error,
      contactId,
      firstName,
      lastName,
      role,
    })
  }
}

export const updateContactSubscriptions = async ({
  contactId,
  firstName,
  lastName,
  role,
  weeklyUpdates,
  email,
}: {
  contactId: string
  firstName: string
  lastName: string
  role: string
  weeklyUpdates: boolean
  email: string
}) => {
  // Update contact details first (firstName, lastName, role)
  await updateContactDetails({
    contactId,
    firstName,
    lastName,
    role,
  })

  // Then update segments and topics
  const { segments, topics } = buildSegmentsAndTopics(weeklyUpdates)

  if (segments.length > 0) {
    await addContactToSegments(contactId, segments)
  }

  if (topics.length > 0) {
    await addContactToTopics(contactId, topics)
  }

  // Resend welcome email
  await sendWelcomeEmail({ firstName, email })
}

export const sendWelcomeEmail = async ({ firstName, email }: SendWelcomeEmailParams) => {
  const response = await resend.emails.send({
    from: 'Rodolfo Rojas <jrg@carpil.app>',
    to: [email],
    template: {
      id: 'welcome',
      variables: {
        first_name: firstName,
      },
    },
  })
  return response
}
