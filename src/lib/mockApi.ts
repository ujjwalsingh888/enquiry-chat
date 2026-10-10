import type { Property } from '../types'

export interface StreamArgs {
  prompt: string
  property: Property
  signal: AbortSignal
  /** 0 for the first try, 1+ for retries. Used to demo the error state. */
  attempt: number
  /** Delay between chunks in ms. Tests set this to 0. */
  delayMs?: number
}

function wait(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal.aborted || ms <= 0) return resolve()

    const timer = setTimeout(finish, ms)

    function finish() {
      clearTimeout(timer)
      signal.removeEventListener('abort', finish)
      resolve()
    }

    signal.addEventListener('abort', finish, { once: true })
  })
}

export function buildReply(prompt: string, property: Property, attempt = 0): string {
  const p = prompt.toLowerCase().trim()
  const address = property.address
  const rent = property.rent

  // Error simulation for demoing Retry. The first attempt streams this text and
  // is then cut off by streamReply, so it must read like a normal reply. Retries
  // get the success text below.
  if (/simulate error/i.test(prompt)) {
    return attempt === 0
      ? `Looking up the latest details for **${address}** now. One moment while I check the listing and confirm the information you asked for.`
      : `Here is the reply you asked for about **${address}**. It loaded on the second attempt, so Retry worked.`
  }

  // Availability
  if (
    /\b(available|availability|vacant|move in|move-in|move into|ready to move)\b/i.test(p)
  ) {
    return `According to the listing, **${address}** is available now.

Would you like to arrange a viewing or learn more about the rental costs?`
  }

  // Rent and pricing
  if (
    /\b(rent|rental|price|pricing|cost|costs|monthly payment|per month|pcm|afford|expensive|cheap)\b/i.test(p)
    && !/\b(deposit|holding deposit|tenancy deposit)\b/i.test(p)
  ) {
    return `The listed monthly rent for **${address}** is **${rent}**.

Would you also like information about the tenancy deposit or other potential moving costs?`
  }

  // Deposits
  if (/\b(deposit|holding deposit|tenancy deposit|security deposit)\b/i.test(p)) {
    return `The listed tenancy deposit for **${address}** is five weeks' rent. Please confirm the exact amount with the lettings team.

| Item | Amount |
| --- | --- |
| Monthly rent | ${rent} |
| Holding deposit | One week's rent (subject to confirmation) |
| Tenancy deposit | Five weeks' rent |

The holding deposit and tenancy deposit are different. Ask the lettings team to confirm the amounts and applicable terms before making a payment.`
  }

  // Pets
  if (/\b(pet|pets|dog|dogs|cat|cats|animal|animals)\b/i.test(p)) {
    return `Pets are considered **case by case** at ${address}, according to the available demo information.

Contact the lettings team to confirm the landlord's pet policy before making arrangements.

Would you like help with another property question?`
  }

  // Viewings
  if (/\b(view|viewing|viewings|visit|appointment|see the property|tour)\b/i.test(p)) {
    return `You can enquire about arranging a viewing for **${address}**.

Please contact the lettings team to confirm available dates and times. No viewing has been booked by this chat.

Would you like to know more about the rent or deposit first?`
  }

  // Repairs and maintenance
  if (/\b(repair|repairs|maintenance|broken|leak|heating|plumbing|damage)\b/i.test(p)) {
    return `For repairs or maintenance at **${address}**, contact the property manager or lettings team and describe the problem.

Include photos if possible and explain whether the issue is urgent. The responsible team can confirm the next steps.`
  }

  // Address and property details
  if (
    /\b(address|where is|location|located|which property|property details|tell me about this property)\b/i.test(p)
  ) {
    return `The property you're enquiring about is:

**${address}**

Listed monthly rent: **${rent}**

For confirmation of additional details, contact the lettings team.`
  }

  // Tenancy agreement and documents
  if (/\b(tenancy agreement|lease|contract|documents|paperwork|reference|references)\b/i.test(p)) {
    return `For the tenancy agreement and required documents for **${address}**, contact the lettings team.

They can confirm the application process, required references, contract terms, and any documents you need to provide.`
  }

  // Contact or escalation
  if (/\b(contact|agent|landlord|lettings team|human|person|speak to someone|pass.*question)\b/i.test(p)) {
    return `I can help with common questions about **${address}**, but I can't directly contact the lettings team or submit a request.

Please use the property's official contact channel for confirmation or further assistance.`
  }

  // Greetings
  if (/^(hi|hello|hey|good morning|good afternoon|good evening)[!. ]*$/i.test(p)) {
    return `Hello! I'm here to help with enquiries about **${address}**.

You can ask about rent, availability, deposits, pets, viewings, repairs, or the tenancy agreement.`
  }

  // Improved fallback
  return `I couldn't find a specific answer to that question about **${address}**.

I can help with:
- Monthly rent and pricing
- Property availability
- Deposits
- Pets
- Viewings
- Repairs and maintenance
- Tenancy agreements

For details that aren't available here, please contact the lettings team.`
}

/** Streams a scripted reply a few words at a time, like a model would. */
export async function* streamReply({
  prompt,
  property,
  signal,
  attempt,
  delayMs = 28,
}: StreamArgs): AsyncGenerator<string> {
  const tokens = buildReply(prompt, property, attempt).split(/(\s+)/).filter(Boolean)
  const shouldFail = /simulate error/i.test(prompt) && attempt === 0

  for (let i = 0; i < tokens.length; i += 2) {
    await wait(delayMs, signal)

    if (signal.aborted) return

    if (shouldFail && i >= 6) {
      throw new Error('Simulated network failure')
    }

    yield tokens.slice(i, i + 2).join('')
  }
}
