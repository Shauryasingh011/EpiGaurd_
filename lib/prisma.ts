/**
 * Firebase Firestore service for backend operations
 * 
 * This module provides utility functions for server-side Firestore operations.
 * Use this in API routes and server-side code to interact with Firestore.
 */

import {
  FirestoreUser,
  FirestoreUserAlertSettings,
  FirestoreTelegramLinkCode,
  saveUser,
  getUser,
  findUserByEmail,
  getUserAlertSettings,
  updateUserAlertSettings,
  createTelegramLinkCode,
  getTelegramLinkCode,
  deleteTelegramLinkCode,
  updateLastAlertSentTime,
  updateLastDailyDigestSentTime,
  getUsersWithTelegramEnabled,
  executeBatch,
} from './firebase/firestore'

/**
 * Export all Firestore functions for API route usage
 */
export {
  saveUser,
  getUser,
  findUserByEmail,
  getUserAlertSettings,
  updateUserAlertSettings,
  createTelegramLinkCode,
  getTelegramLinkCode,
  deleteTelegramLinkCode,
  updateLastAlertSentTime,
  updateLastDailyDigestSentTime,
  getUsersWithTelegramEnabled,
  executeBatch,
}

/**
 * Export Firestore types
 */
export type {
  FirestoreUser,
  FirestoreUserAlertSettings,
  FirestoreTelegramLinkCode,
}

/**
 * Convenience object for accessing Firestore operations
 */
export const db = {
  users: {
    save: saveUser,
    get: getUser,
    findByEmail: findUserByEmail,
  },
  userAlertSettings: {
    get: getUserAlertSettings,
    update: updateUserAlertSettings,
    updateLastAlertSentTime,
    updateLastDailyDigestSentTime,
  },
  telegramLinkCodes: {
    create: createTelegramLinkCode,
    get: getTelegramLinkCode,
    delete: deleteTelegramLinkCode,
  },
  batch: executeBatch,
}
