// 来源：Compliance.dc.html
import type { ComplianceSummary } from '../types'

export const complianceSummary: ComplianceSummary = {
  standard: 'GB/T 17775-2024',
  subtitle: '对照 GB/T 17775-2024 智慧旅游及相关条款 · 当前等级 4A · 示例数据',
  // 统计卡为全量条款的汇总，表格只展示与本产品相关的 5 条
  counts: { pass: 9, partial: 4, fail: 2, na: 1 },
  items: [
    { clause: '[条款号]', requirement: '提供自助导览，具备导航、导览、景点讲解功能', result: 'pass', evidence: '自动：本月讲解调用 12,480 次，覆盖 18 个点位', gap: '—' },
    { clause: '[条款号]', requirement: '公布最大承载量，并控制高峰期客流', result: 'partial', evidence: '自动：机位时段热度记录 92 天；景区上传：承载量公示照片', gap: '缺少分区客流预警记录；Next 版本的「承载预警」可补齐' },
    { clause: '[条款号]', requirement: '完善投诉处理机制，提高游客满意度', result: 'pass', evidence: '自动：游中反馈 146 单，30 分钟受理率 92%，满意率 88%', gap: '—' },
    { clause: '[条款号]', requirement: '解说信息化：讲解内容准确、多形式', result: 'partial', evidence: '自动：知识库已审核条目 326 条；抽检准确率 97%', gap: '尚无外语讲解，建议评估多语种（Later）' },
    { clause: '[条款号]', requirement: '智慧营销：多渠道信息发布与互动', result: 'fail', evidence: '景区上传：暂无', gap: '需补充官方新媒体账号运营记录' },
  ],
  disclaimer: '本报告为自检辅助材料，不代表评定机构结论。条款要点据 GB/T 17775-2024 整理，条款号待实施时按标准原文填写。',
}
