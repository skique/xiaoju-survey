import axios from './base'

export const register = (data) => {
  return axios.post('/auth/register', data)
}

export const login = (data) => {
  return axios.post('/auth/login', data)
}

export const getUserInfo = () => {
  return axios.get('/user/getUserInfo')
}
/** 获取密码强度 */
export const getPasswordStrength = (password) => {
  return axios.get('/auth/password/strength', {
    params: {
      password
    }
  })
}

export const checkIsTokenValid = () => {
  return axios.get('/auth/verifyToken')
}

export const externalAuth = ({ kind, state }) => {
  return axios.post(`/externalAuth/authUrl/${kind}?state=${state}`)
}

export const bindUser = ({ eid, username, password }) => {
  return axios.post('/externalAuth/bindAccount', {
    eid,
    username,
    password,
  })
}

export const registerExternalUser = ({ eid, username, password }) => {
  return axios.post('/externalAuth/register', {
    eid,
    username,
    password,
  })
}
