# Pasha

A private chat site where trusted guests converse with an AI persona standing in for a real person ("Pasha"). Purpose is entertainment for a small, trusted circle — not a general-purpose chatbot product.

## Language

**Persona**:
The character definition the AI plays — a system prompt written by the person being impersonated, describing their voice, facts, and personality. Owned and edited by the Admin, never by Claude/the app's default content.
_Avoid_: Character, bot, system prompt (when referring to the concept, not the raw text)

**Guest**:
A visitor who has authenticated with the shared password and is chatting with the Persona.
_Avoid_: User, visitor, client

**Admin**:
The person who owns the Persona (the real "Pasha") and edits its definition through the admin page. Authenticated separately from Guests, with a distinct password.
_Avoid_: Owner, brother (that's who they are outside the system, not their role in it)

**Conversation**:
The sequence of messages exchanged between a Guest and the Persona. Held entirely client-side (in the browser) and resent in full with each new message; never persisted server-side.
_Avoid_: Session history, chat log, thread

**Session**:
A Guest's authenticated identity for a single browser, established at password entry via a cookie. Scopes rate-limiting; carries no conversation state.
_Avoid_: Login, account
