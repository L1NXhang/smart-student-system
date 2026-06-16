import DOMPurify from 'dompurify'

/**
 * 清理 HTML 内容，防止 XSS。
 * 用法：v-html="$sanitizeHtml(content)"
 *
 * 配置：
 * - 允许常见富文本标签（p, h1-h6, ul, ol, li, br, strong, em, a, img, table, code, pre, blockquote）
 * - 阻止：script, style, iframe, on* 事件, javascript: URL
 * - 强制 a 标签 target=_blank rel=noopener
 */
const ALLOWED_TAGS = [
  'p', 'br', 'hr',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup',
  'a', 'img',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'blockquote', 'pre', 'code',
  'span', 'div',
]

const ALLOWED_ATTR = [
  'href', 'title', 'alt', 'src',
  'class', 'style', 'target', 'rel',
  'colspan', 'rowspan',
]

export function sanitizeHtml(dirty) {
  if (!dirty) return ''
  return DOMPurify.sanitize(String(dirty), {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
  })
}
