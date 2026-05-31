const prefix = 'banners'

export const bannerEndpoints = {
  getBanners: `${prefix}/list`,
  saveBanner: `${prefix}/save`,
  getBannerById: (bannerId: number) => `${prefix}/${bannerId}`,
  toggleBannerStatus: (bannerId: number) => `${prefix}/toggle-status/${bannerId}`,
  deleteBanner: (bannerId: number) => `${prefix}/delete/${bannerId}`
}
