import { REVIEW_SPOT_NAMES, REVIEW_TAGS, mockRequest, reviewItems, reviewsMeta } from '@qs/shared'

export const getReviews = () => mockRequest(reviewItems, [])

/** 字典，同步取 */
export const meta = reviewsMeta
export const tags = REVIEW_TAGS
export const spotName = (spot: string) => REVIEW_SPOT_NAMES[spot] ?? spot
export const tagLabel = (slug: string) => REVIEW_TAGS.find((t) => t.slug === slug)?.label ?? slug
export const tagSlug = (label: string) => REVIEW_TAGS.find((t) => t.label === label)?.slug ?? 'other'

export const saveTags = (id: string, tagList: string[]) => mockRequest({ id, tags: tagList })
export const saveReply = (id: string, reply: string) => mockRequest({ id, reply })
