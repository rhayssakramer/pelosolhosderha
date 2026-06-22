import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import path from 'path';
import fs from 'fs';
import { config } from './env';

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING || '';
const AZURE_STORAGE_CONTAINER = process.env.AZURE_STORAGE_CONTAINER || 'uploads';

let containerClient: ContainerClient | null = null;

/**
 * Returns true if Azure Blob Storage is configured (production).
 * Falls back to local disk storage in development.
 */
export function isCloudStorageEnabled(): boolean {
  return !!AZURE_STORAGE_CONNECTION_STRING;
}

/**
 * Initialize Azure Blob Storage container client.
 * Creates the container if it doesn't exist.
 */
async function getContainerClient(): Promise<ContainerClient> {
  if (containerClient) return containerClient;

  const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
  containerClient = blobServiceClient.getContainerClient(AZURE_STORAGE_CONTAINER);

  // Create container with public (blob-level) access if it doesn't exist
  await containerClient.createIfNotExists({ access: 'blob' });

  return containerClient;
}

/**
 * Upload a file to Azure Blob Storage.
 * Returns the public URL of the uploaded blob.
 */
export async function uploadToCloud(filePath: string, blobName: string, mimeType: string): Promise<string> {
  const client = await getContainerClient();
  const blockBlobClient = client.getBlockBlobClient(blobName);

  const fileBuffer = fs.readFileSync(filePath);
  await blockBlobClient.uploadData(fileBuffer, {
    blobHTTPHeaders: {
      blobContentType: mimeType,
      blobCacheControl: 'public, max-age=31536000', // Cache for 1 year (immutable files)
    },
  });

  // Clean up local temp file
  fs.unlinkSync(filePath);

  return blockBlobClient.url;
}

/**
 * Delete a blob from Azure Blob Storage.
 */
export async function deleteFromCloud(blobName: string): Promise<void> {
  try {
    const client = await getContainerClient();
    const blockBlobClient = client.getBlockBlobClient(blobName);
    await blockBlobClient.deleteIfExists();
  } catch (err) {
    console.error('Error deleting blob:', err);
  }
}

/**
 * Get the public URL for a locally stored file (development fallback).
 */
export function getLocalFileUrl(filename: string): string {
  return `/uploads/${filename}`;
}
