import log from 'electron-log'

export const getRandomArbitrary = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min)
}

export const handleResponse = (resp) => {
  const { body, statusCode, request } = resp
  log.info(`接口 ${request.href} 请求结果：${statusCode}`)
  let result = parseJson(body)
  try {
    result = JSON.parse(result)
    log.info('response result:', result)
  } catch (error) {
    log.info('response body is not JSON.')
  }
  return result
}

function parseJson(body) {
  if (typeof body === 'string') {
    const token = body.indexOf("<script>window.location.href='http://item.jd.com/html/token.html")
    return token > -1 ? false : body
  }
}
