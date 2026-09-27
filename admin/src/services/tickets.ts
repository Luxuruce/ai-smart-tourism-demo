import { mockRequest, ticketRules, ticketSummary, tickets } from '@qs/shared'

export const getTickets = () => mockRequest(tickets, [])
export const getTicketSummary = () => mockRequest(ticketSummary)
export const getTicketRules = () => mockRequest(ticketRules, [])
