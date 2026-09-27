import {
  TICKET_STAGES, mockRequest, ticketBaseCounts, ticketGroup, ticketListTitle, ticketOwners, ticketRules, tickets,
} from '@qs/shared'

export const getTickets = () => mockRequest(tickets, [])
export const getTicketRules = () => mockRequest(ticketRules, [])

/** 字典与统计口径，同步取 */
export const baseCounts = ticketBaseCounts
export const listTitle = ticketListTitle
export const owners = ticketOwners
export const stages = TICKET_STAGES
export const groupOf = ticketGroup

/** 工单操作（受理 / 转派 / 标记已解决 / 关闭），原型阶段只模拟网络延迟 */
export const updateTicket = (id: string, action: string) => mockRequest({ id, action })
