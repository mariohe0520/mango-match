# 芒果消消乐 v2 — 编码规范

## 继承
遵守 `../../GAME_STANDARDS.md` 通用标准

## 特有规范
- 三消逻辑和渲染分离
- 动画用 CSS transition/animation，不用 JS 定时器
- 关卡数据结构化（JSON 配置）
- 触控事件用 touch 系列，不是 mouse
- 音效可选（静音按钮必须有）
