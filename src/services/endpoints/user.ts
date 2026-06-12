const prefix = 'users'

export const userEndpoints = {
  getUser: `${prefix}/list`,
  getUserById: (userId: number) => `${prefix}/${userId}`,
  saveUser: `${prefix}/save`,
  deleteUser: (userId: number) => `${prefix}/delete/${userId}`
}
