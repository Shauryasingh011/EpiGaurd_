import {
  ref,
  uploadBytes,
  downloadURL,
  deleteObject,
  listAll,
  getBytes,
} from 'firebase/storage'
import { storage } from './config'

/**
 * Upload a file to Firebase Cloud Storage
 */
export async function uploadFile(
  path: string,
  file: File | Blob,
  metadata?: any
) {
  const storageRef = ref(storage, path)
  const snapshot = await uploadBytes(storageRef, file, metadata)
  return snapshot
}

/**
 * Upload file and get download URL
 */
export async function uploadFileAndGetUrl(
  path: string,
  file: File | Blob,
  metadata?: any
): Promise<string> {
  await uploadFile(path, file, metadata)
  return await downloadURL(ref(storage, path))
}

/**
 * Get download URL for a file
 */
export async function getFileUrl(path: string): Promise<string> {
  const storageRef = ref(storage, path)
  return await downloadURL(storageRef)
}

/**
 * Delete a file from storage
 */
export async function deleteFile(path: string) {
  const storageRef = ref(storage, path)
  await deleteObject(storageRef)
}

/**
 * Get file contents as bytes
 */
export async function getFileBytes(path: string): Promise<ArrayBuffer> {
  const storageRef = ref(storage, path)
  return await getBytes(storageRef)
}

/**
 * List files in a directory
 */
export async function listFiles(folderPath: string) {
  const folderRef = ref(storage, folderPath)
  return await listAll(folderRef)
}

/**
 * Upload user avatar
 */
export async function uploadUserAvatar(userId: string, file: File | Blob): Promise<string> {
  const path = `avatars/${userId}/profile-picture`
  return await uploadFileAndGetUrl(path, file)
}

/**
 * Delete user avatar
 */
export async function deleteUserAvatar(userId: string) {
  const path = `avatars/${userId}/profile-picture`
  await deleteFile(path)
}

/**
 * Upload file to user folder
 */
export async function uploadToUserFolder(
  userId: string,
  fileName: string,
  file: File | Blob
): Promise<string> {
  const path = `user-files/${userId}/${fileName}`
  return await uploadFileAndGetUrl(path, file)
}
