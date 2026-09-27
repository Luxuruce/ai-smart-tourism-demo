"""把 Noto Sans SC / Noto Serif SC 裁剪成只含本项目用到的字，输出 woff2。

生成结果已提交到仓库，只有新增了文案（出现新汉字）时才需要重新运行：

    pip install fonttools brotli
    python scripts/subset-fonts.py <字体源文件目录>

字体源文件目录里需要有 Google Fonts 的可变字体（OFL 授权）：
    NotoSansSC[wght].ttf   https://github.com/google/fonts/tree/main/ofl/notosanssc
    NotoSerifSC[wght].ttf  https://github.com/google/fonts/tree/main/ofl/notoserifsc

输出：
    packages/shared/fonts/*.woff2          后台通过 CSS 引用
    visitor/src/static/web/fonts/*.woff2   游客端 H5 引用（static/web 只在 H5 打包，不进小程序包）
"""

import shutil
import sys
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parent.parent
SOURCE_EXT = {'.vue', '.ts', '.mts', '.html', '.json', '.scss', '.css'}
SKIP_DIRS = {'node_modules', 'dist', 'unpackage', 'static', 'fonts'}

# (源文件名, 输出名, 保留的字重范围)
FONTS = [
    (['NotoSansSC[wght].ttf', 'NotoSansSC.ttf'], 'NotoSansSC-subset.woff2', (400, 700)),
    (['NotoSerifSC[wght].ttf', 'NotoSerifSC.ttf'], 'NotoSerifSC-subset.woff2', (600, 700)),
]

# 用户可能输入、但源码里不一定出现的常用标点和符号
EXTRA = '，。、；：？！…—–·“”‘’（）【】《》「」『』〈〉～￥％＋－×÷℃°→←↑↓›‹•　'


def collect_chars() -> str:
    chars = {chr(c) for c in range(0x20, 0x7F)} | set(EXTRA)
    for path in ROOT.rglob('*'):
        if path.suffix not in SOURCE_EXT or any(p in SKIP_DIRS for p in path.parts):
            continue
        chars |= set(path.read_text(encoding='utf-8', errors='ignore'))
    return ''.join(sorted(c for c in chars if c.isprintable() or c == '　'))


def build(src: Path, out: Path, wght: tuple[int, int], text: str) -> None:
    # 先裁字再限制字重范围：顺序反过来时 fontTools 处理大字体会出错，也更慢
    font = TTFont(src)
    options = subset.Options()
    options.flavor = 'woff2'
    options.layout_features = ['*']
    options.name_IDs = ['*']
    options.notdef_outline = True
    subsetter = subset.Subsetter(options)
    subsetter.populate(text=text)
    subsetter.subset(font)
    font = instantiateVariableFont(font, {'wght': wght})
    out.parent.mkdir(parents=True, exist_ok=True)
    font.flavor = 'woff2'
    font.save(out)


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    src_dir = Path(sys.argv[1])
    text = collect_chars()
    cjk = sum(1 for c in text if '一' <= c <= '鿿')
    print(f'共 {len(text)} 个字符，其中汉字 {cjk} 个')
    shared = ROOT / 'packages/shared/fonts'
    visitor = ROOT / 'visitor/src/static/web/fonts'
    for names, out_name, wght in FONTS:
        src = next((src_dir / n for n in names if (src_dir / n).exists()), None)
        if src is None:
            sys.exit(f'找不到字体源文件：{names[0]}')
        out = shared / out_name
        build(src, out, wght, text)
        visitor.mkdir(parents=True, exist_ok=True)
        shutil.copy(out, visitor / out_name)
        print(f'{out_name}: {out.stat().st_size / 1024:.0f} KB')


if __name__ == '__main__':
    main()
