import JwtDecode from 'jwt-decode'
import { Cookies } from 'react-cookie'
import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import { COOKIE_JWT_TOKEN_KEY, NITRO_URL, TEST_URL_PREFIX, XALPHA_URL } from '../constants'

const cookies = new Cookies()
const { hostname } = window.location
const isLocal = ['localhost', '127.0.0.1', '0.0.0.0'].includes(hostname)
const isTest = isLocal || hostname.startsWith(TEST_URL_PREFIX)

export function gBaseUrl() {
  if (isLocal) return `https://${TEST_URL_PREFIX}${NITRO_URL}` // nitrox case
  return 'https://' + hostname
}

export function gBaseUrlXalpha() {
  return `https://${isTest ? TEST_URL_PREFIX : ''}${XALPHA_URL}`
}

export function _domainFromUrl() {
  if (isLocal) return hostname
  const _dm = gBaseUrl().split('.')
  _dm[0] = ''
  return _dm.join('.')
}

export function getUserPayload() {
  const token = cookies.get(COOKIE_JWT_TOKEN_KEY)
  return JwtDecode(token)
}

const _domain = _domainFromUrl()

export const gRequest = (client: AxiosInstance) => (options: AxiosRequestConfig) => {
  const token = cookies.get(COOKIE_JWT_TOKEN_KEY)
  const onSuccess = function (response) {
    // console.log("success", response.data);
    return response.data
  }
  const onError = function (error) {
    try {
      console.log('error', error.response.data)
      if (error.response.data && ['invalid token', 'token expired'].includes(error.response.data.detail)) {
        cookies.remove(COOKIE_JWT_TOKEN_KEY, {
          path: '/',
          domain: _domain,
        })
        window.location.href = '/'
      }
      return Promise.reject(error.response.data)
    } catch (e) {
      const data = {
        message: 'Server not responding or timeout!',
      }
      console.log(data)
      return Promise.reject(data)
    }
  }
  options.headers = {
    'Alt-Auth-Token': token,
    'Content-Type': 'application/json',
  }
  return client(options).then(onSuccess).catch(onError)
}
