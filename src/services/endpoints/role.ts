const prefix = 'roles'

export const roleEndpoints = {
  getRole: `${prefix}/list`,
  saveRole: `${prefix}/save`,
  getRoleById: (userId: number) => `${prefix}/${userId}`,
  deleteRole: (userId: number) => `${prefix}/delete/${userId}`
}
