// 来源：开发交接文档 v1.2 附录 C.2
import type { Coupon } from '../types'

/** 排队页「附近」的领券按钮对应的券；只有领过才出现在「我的优惠券」里 */
export const couponCatalog: Record<string, Coupon> = {
  '[商户] 阁前茶铺': {
    id: 'tea-5',
    merchant: '[商户] 阁前茶铺',
    title: '5 元代金券',
    threshold: '满 20 元可用',
    expiry: '今天 17:30 前',
    code: 'QS 2046 18 [示例]',
    redeem: '出示给商户扫码核销',
    status: 'active',
  },
}

export const couponEmpty = '还没有优惠券，排队时可以在「附近」领取'
