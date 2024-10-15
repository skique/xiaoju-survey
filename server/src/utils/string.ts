import { load } from 'cheerio'

export const unescape = html => {
  if (typeof html !== 'string') return html + ''
  return html
    .replace(html ? /&(?!#?\w+;)/g : /&/g, '&amp;')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, '')
}

export const cleanRichText = text => {
  if (typeof text === 'undefined' || (typeof text === 'object' && !Array.isArray(text))) return text
  const html = unescape(text)
  const $ = load(html)
  return $.text()
}

export const parse = text => {
  const $ = load(unescape(text))
  const content = $.text()
  const imgsDom = $('img')
  const videosDom = $('video')

  const imgUrls: Array<string> = []
  const videoUrls: Array<string> = []

  for (let i = 0; i < imgsDom.length; i++) {
    const src = imgsDom[i].attribs.src
    if (src) {
      imgUrls.push(src)
    }
  }

  for (let i = 0; i < videosDom.length; i++) {
    const src = videosDom[i].attribs.src
    if (src) {
      videoUrls.push(src)
    }
  }

  return {
    content,
    imgUrls,
    videoUrls,
  }
}

export const fillUrl = url => {
  if (url.startsWith('http')) {
    return url
  }
  if (url.startsWith('//')) {
    return `http:${url}`
  }
  return `http://${url}`
}