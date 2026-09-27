// 生成游客端的静态图片资源（结果已提交到仓库，改了图标或 token 才需要重新跑）：
//   static/icons/{theme}/{name}--{color}.svg   页面图标
//   static/tabbar/{theme}/{tab}[-active].png   原生 tabBar 图标，81×81
//   static/map/{base|route}-{theme}.svg        示意地图底图与观光车路线（「我的位置」蓝点由页面绘制，关闭定位时隐藏）
// 用法：pnpm gen:icons
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { themes, type ThemeName, type TokenName } from '@qs/shared'
import { icons, tabBarIcons, type IconDef } from '../src/icons.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../src/static')

function iconSvg(def: IconDef, color: string, size = 24): string {
  const paint = def.filled
    ? `fill="${color}"`
    : `fill="none" stroke="${color}" stroke-width="${def.strokeWidth ?? 1.8}" stroke-linecap="round" stroke-linejoin="round"`
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" ${paint}>${def.body}</svg>\n`
}

function write(path: string, content: string | Buffer) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, content)
}

// 示意地图：坐标来自 Map.dc.html 的 350×380 画布
function mapBaseSvg(t: Record<TokenName, string>): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="350" height="380" viewBox="0 0 350 380" fill="none">
<path d="M-10 290 C 60 260, 120 320, 190 290 S 300 230, 360 250" stroke="${t.river}" stroke-width="22" stroke-linecap="round"/>
<path d="M40 60 L 90 150 L 170 170 L 250 110 L 310 190" stroke="${t.placeholder}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M90 150 L 120 320 M170 170 L 232 330 M175 360 L 170 170" stroke="${t.placeholder}" stroke-width="7" stroke-linecap="round"/>
</svg>
`
}

function mapRouteSvg(t: Record<TokenName, string>): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="350" height="380" viewBox="0 0 350 380" fill="none">
<path d="M130 350 C 70 335, 45 260, 70 185 C 110 120, 230 60, 315 160" stroke="${t['primary-fg']}" stroke-width="3" stroke-dasharray="7 6" stroke-linecap="round"/>
</svg>
`
}

async function main() {
  rmSync(resolve(root, 'icons'), { recursive: true, force: true })
  let count = 0
  for (const theme of Object.keys(themes) as ThemeName[]) {
    const t = themes[theme]
    for (const [name, def] of Object.entries(icons) as [string, IconDef][]) {
      for (const color of def.colors) {
        write(resolve(root, `icons/${theme}/${name}--${color}.svg`), iconSvg(def, t[color]))
        count++
      }
    }
    for (const tab of tabBarIcons) {
      const def = icons[tab.icon]
      for (const [suffix, color] of [['', t['text-2']], ['-active', t['action-fg']]] as const) {
        // tabBar 图标在 81px 画布里按 22/24 比例绘制，与原型 22px 图标一致
        const png = await sharp(Buffer.from(iconSvg(def, color, 81))).png().toBuffer()
        write(resolve(root, `tabbar/${theme}/${tab.file}${suffix}.png`), png)
      }
    }
    write(resolve(root, `map/base-${theme}.svg`), mapBaseSvg(t))
    write(resolve(root, `map/route-${theme}.svg`), mapRouteSvg(t))
  }
  console.log(`已生成 ${count} 个图标、${tabBarIcons.length * 4} 个 tabBar 图标、4 张地图图层`)
}

main()
