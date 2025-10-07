const prefix = 'users'

export const userEndpoints = {
  getUser: `${prefix}/list`,
  saveUser: `${prefix}/save`,
  deleteUser: `${prefix}/delete`,
  getUsers: `${prefix}/all`
}
