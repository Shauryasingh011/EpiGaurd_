import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  QueryConstraint,
  QueryCompositeFilterConstraint,
  Timestamp,
  WriteBatch,
  writeBatch,
} from 'firebase/firestore'
import { firestore } from './config'

/**
 * User profile document
 */
export type FirestoreUser = {
  id: string
  email?: string
  name?: string
  image?: string
  emailVerified?: boolean
  telegramChatId?: string
  telegramUsername?: string
  telegramOptIn?: boolean
  telegramOptInAt?: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * User alert settings document
 */
export type FirestoreUserAlertSettings = {
  id: string
  userId: string
  selectedState: string
  browserEnabled: boolean
  telegramEnabled: boolean
  dailyDigestEnabled: boolean
  threshold: 'HIGH' | 'CRITICAL'
  cooldownMinutes: number
  lastAlertSentAt?: Timestamp
  lastDailyDigestSentAt?: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * Telegram link code document
 */
export type FirestoreTelegramLinkCode = {
  id: string
  userId: string
  code: string
  expiresAt: Timestamp
  createdAt: Timestamp
}

/**
 * Create or update a user in Firestore
 */
export async function saveUser(userId: string, userData: Partial<FirestoreUser>) {
  const userRef = doc(firestore, 'users', userId)
  const now = Timestamp.now()
  
  const existingDoc = await getDoc(userRef)
  
  const dataToSave: any = {
    ...userData,
    id: userId,
    updatedAt: now,
  }
  
  if (!existingDoc.exists()) {
    dataToSave.createdAt = now
  }
  
  await setDoc(userRef, dataToSave, { merge: true })
  return dataToSave
}

/**
 * Get user from Firestore
 */
export async function getUser(userId: string): Promise<FirestoreUser | null> {
  const userRef = doc(firestore, 'users', userId)
  const docSnap = await getDoc(userRef)
  
  if (docSnap.exists()) {
    return docSnap.data() as FirestoreUser
  }
  
  return null
}

/**
 * Find user by email
 */
export async function findUserByEmail(email: string): Promise<FirestoreUser | null> {
  const q = query(collection(firestore, 'users'), where('email', '==', email))
  const querySnapshot = await getDocs(q)
  
  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].data() as FirestoreUser
  }
  
  return null
}

/**
 * Get or create user alert settings
 */
export async function getUserAlertSettings(userId: string): Promise<FirestoreUserAlertSettings> {
  const q = query(
    collection(firestore, 'userAlertSettings'),
    where('userId', '==', userId)
  )
  const querySnapshot = await getDocs(q)
  
  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].data() as FirestoreUserAlertSettings
  }
  
  // Create default settings
  const now = Timestamp.now()
  const newSettings: FirestoreUserAlertSettings = {
    id: userId + '_alerts',
    userId,
    selectedState: '',
    browserEnabled: true,
    telegramEnabled: false,
    dailyDigestEnabled: true,
    threshold: 'HIGH',
    cooldownMinutes: 60,
    createdAt: now,
    updatedAt: now,
  }
  
  await setDoc(
    doc(firestore, 'userAlertSettings', newSettings.id),
    newSettings
  )
  
  return newSettings
}

/**
 * Update user alert settings
 */
export async function updateUserAlertSettings(
  userId: string,
  settings: Partial<Omit<FirestoreUserAlertSettings, 'id' | 'userId' | 'createdAt'>>
) {
  const q = query(
    collection(firestore, 'userAlertSettings'),
    where('userId', '==', userId)
  )
  const querySnapshot = await getDocs(q)
  
  if (!querySnapshot.empty) {
    const docRef = querySnapshot.docs[0].ref
    await updateDoc(docRef, {
      ...settings,
      updatedAt: Timestamp.now(),
    })
  }
}

/**
 * Create a telegram link code
 */
export async function createTelegramLinkCode(
  userId: string,
  code: string,
  expiresInMinutes: number = 15
) {
  const now = Timestamp.now()
  const expiresAt = new Timestamp(
    now.seconds + expiresInMinutes * 60,
    now.nanoseconds
  )
  
  const linkCode: FirestoreTelegramLinkCode = {
    id: code,
    userId,
    code,
    expiresAt,
    createdAt: now,
  }
  
  await setDoc(
    doc(firestore, 'telegramLinkCodes', code),
    linkCode
  )
  
  return linkCode
}

/**
 * Get telegram link code
 */
export async function getTelegramLinkCode(code: string): Promise<FirestoreTelegramLinkCode | null> {
  const docRef = doc(firestore, 'telegramLinkCodes', code)
  const docSnap = await getDoc(docRef)
  
  if (docSnap.exists()) {
    const data = docSnap.data() as FirestoreTelegramLinkCode
    
    // Check if expired
    if (data.expiresAt.toMillis() < Date.now()) {
      await deleteDoc(docRef)
      return null
    }
    
    return data
  }
  
  return null
}

/**
 * Delete telegram link code
 */
export async function deleteTelegramLinkCode(code: string) {
  await deleteDoc(doc(firestore, 'telegramLinkCodes', code))
}

/**
 * Update last alert sent time
 */
export async function updateLastAlertSentTime(userId: string) {
  const q = query(
    collection(firestore, 'userAlertSettings'),
    where('userId', '==', userId)
  )
  const querySnapshot = await getDocs(q)
  
  if (!querySnapshot.empty) {
    const docRef = querySnapshot.docs[0].ref
    await updateDoc(docRef, {
      lastAlertSentAt: Timestamp.now(),
    })
  }
}

/**
 * Update last daily digest sent time
 */
export async function updateLastDailyDigestSentTime(userId: string) {
  const q = query(
    collection(firestore, 'userAlertSettings'),
    where('userId', '==', userId)
  )
  const querySnapshot = await getDocs(q)
  
  if (!querySnapshot.empty) {
    const docRef = querySnapshot.docs[0].ref
    await updateDoc(docRef, {
      lastDailyDigestSentAt: Timestamp.now(),
    })
  }
}

/**
 * Get all users with telegram enabled
 */
export async function getUsersWithTelegramEnabled(): Promise<FirestoreUser[]> {
  const q = query(
    collection(firestore, 'users'),
    where('telegramOptIn', '==', true)
  )
  const querySnapshot = await getDocs(q)
  
  return querySnapshot.docs.map(doc => doc.data() as FirestoreUser)
}

/**
 * Execute batch write operations
 */
export async function executeBatch(callback: (batch: WriteBatch) => Promise<void>) {
  const batch = writeBatch(firestore)
  await callback(batch)
  await batch.commit()
}
