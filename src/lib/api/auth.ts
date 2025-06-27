import { api } from '../axios'

interface ProfileResponse {
  data: {
    id: number
    name: string
    email: string
    image: string
    provider: string
  }
}

export const Auth = {
  getProfile: async (): Promise<ProfileResponse> => {
    return api.get<ProfileResponse>('/user/get')
  },
}