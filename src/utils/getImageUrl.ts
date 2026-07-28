export const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return ''

  if (imagePath.startsWith('http') || imagePath.startsWith('blob:') || imagePath.startsWith('data:')) {
    return imagePath
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''

  if (imagePath.startsWith('/uploads/')) {
    const base = apiUrl.replace(/\/api\/?$/, '')

    return `${base}${imagePath}`
  }

  const baseImgUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || ''
  const prefix = baseImgUrl.endsWith('/') ? baseImgUrl : `${baseImgUrl}/`
  const suffix = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath

  return `${prefix}${suffix}`
}
