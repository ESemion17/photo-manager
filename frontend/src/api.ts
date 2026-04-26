import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:5000/api' })

export interface Photo {
  id: number
  fileName: string
  filePath: string
  fileSize: number
  width: number
  height: number
  dateTaken: string | null
  dateIndexed: string
  latitude: number | null
  longitude: number | null
  cameraModel: string | null
  isDeleted: boolean
  thumbnailUrl: string
  imageUrl: string
  faces: Face[]
}

export interface Face {
  id: number
  faceX: number
  faceY: number
  faceWidth: number
  faceHeight: number
  confidence: number
  personId: number | null
  personName: string | null
}

export interface Person {
  id: number
  name: string
  createdAt: string
  photoCount: number
}

export interface SimilarityGroup {
  id: number
  similarityScore: number
  isResolved: boolean
  photos: SimilarGroupPhoto[]
}

export interface SimilarGroupPhoto {
  photoId: number
  fileName: string
  fileSize: number
  dateTaken: string | null
  thumbnailUrl: string
  imageUrl: string
  isKept: boolean
}

export interface PagedPhotos {
  total: number
  page: number
  pageSize: number
  photos: Photo[]
}

export const photosApi = {
  list: (page = 1, pageSize = 50) =>
    api.get<PagedPhotos>('/photos', { params: { page, pageSize } }).then(r => r.data),

  startIndexing: (folderPath: string) =>
    api.post('/photos/index', { folderPath }).then(r => r.data),

  indexingStatus: () =>
    api.get<{ isIndexing: boolean; processed: number; total: number; currentFile: string }>(
      '/photos/indexing-status'
    ).then(r => r.data),

  softDelete: (id: number) => api.delete(`/photos/${id}`),
  restore: (id: number) => api.post(`/photos/${id}/restore`),
  purgeTrash: (days = 30) => api.delete(`/photos/purge-trash?olderThanDays=${days}`),
}

export const similarityApi = {
  getGroups: (level: number) =>
    api.get<{ level: number; groupCount: number; groups: SimilarityGroup[] }>(
      '/similarity/groups', { params: { level } }
    ).then(r => r.data),

  resolveGroup: (groupId: number, keepPhotoIds: number[]) =>
    api.post(`/similarity/groups/${groupId}/resolve`, { keepPhotoIds }),

  bulkResolve: (groupIds: number[]) =>
    api.post('/similarity/bulk-resolve', { groupIds }),
}

export const personsApi = {
  list: () => api.get<Person[]>('/persons').then(r => r.data),
  create: (name: string) => api.post<Person>('/persons', { name }).then(r => r.data),
  rename: (id: number, name: string) => api.put(`/persons/${id}`, { name }),
  getPhotos: (id: number) => api.get(`/persons/${id}/photos`).then(r => r.data),
  assignFace: (faceId: number, personId: number) =>
    api.post('/persons/assign-face', { faceId, personId }),
}

export default api
