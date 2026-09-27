import { couponCatalog, couponEmpty, mockRequest, type Coupon } from '@qs/shared'

export const emptyText = couponEmpty

/** 我的优惠券：只有领过的券；key 形如「{机位 id}:{商户名}」 */
export function getMyCoupons(claimedKeys: string[]): Promise<Coupon[]> {
  const list = claimedKeys
    .map((k) => couponCatalog[k.slice(k.indexOf(':') + 1)])
    .filter((c): c is Coupon => !!c)
  return mockRequest(list, [])
}
