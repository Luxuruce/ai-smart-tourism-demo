import { complianceSummary, mockRequest } from '@qs/shared'

export const getComplianceSummary = () => mockRequest(complianceSummary, { ...complianceSummary, items: [] })
