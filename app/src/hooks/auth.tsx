import { createContext, useContext, useEffect, useState } from 'react'
import * as AuthSession from 'expo-auth-session'
import { api } from '../services/api'
import AsyncStorage from '@react-native-async-storage/async-storage'

const CLIENT_ID = '9d4ddebe48ad5cdc1d39'
const SCOPE = 'read:user'
const USER_STORAGE = '@nlwheat:user'
const TOKEN_STORAGE = '@nlwheat:token'

type User = {
  id: string
  avatar_url: string
  name: string
  login: string
}

type AuthContextData = {
  user: User | null
  isSigningIn: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext({} as AuthContextData)

type AuthProviderProps = {
  children: React.ReactNode
}

type AuthResponse = {
  token: string
  user: User
}

type AuthorizationResponse = {
  params: {
    code?: string
    error?: string
  },
  type?: string
}

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isSigningIn, setIsSigningIn] = useState(true)

  useEffect(() => {
    async function loadUserStorageData() {
      const [userStorage, tokenStorage] = await AsyncStorage.multiGet([USER_STORAGE, TOKEN_STORAGE])

      if (userStorage[1] && tokenStorage[1]) {
        api.defaults.headers.common['Authorization'] = `Bearer ${tokenStorage[1]}`
        setUser(JSON.parse(userStorage[1]))
      }

      setIsSigningIn(false)
    }

    loadUserStorageData()
  }, [])

  async function signIn() {
    try {
      setIsSigningIn(true)

      const authUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=${SCOPE}`
      const authSessionResponse = await AuthSession.startAsync({ authUrl }) as AuthorizationResponse

      if (authSessionResponse.type === 'success' && authSessionResponse.params.error !== 'access_denied') {
        const authResponse = await api.post('/authenticate', { code: authSessionResponse.params.code })

        const { user, token } = authResponse.data as AuthResponse

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`

        await AsyncStorage.multiSet([
          [USER_STORAGE, JSON.stringify(user)],
          [TOKEN_STORAGE, token]
        ])

        setUser(user)
      }
    } catch (err) {
      console.log(err)
    } finally {
      setIsSigningIn(false)
    }
  }

  async function signOut() {
    setUser(null)

    await AsyncStorage.multiRemove([USER_STORAGE, TOKEN_STORAGE])
  }

  return (
    <AuthContext.Provider value={{ user, isSigningIn, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

function useAuth() {
  const context = useContext(AuthContext)

  return context
}

export { AuthProvider, useAuth }