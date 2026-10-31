export interface UserProfile {
  id: string;
  name: string;
  username: string;
  phoneNumber: string;
}

export interface StorageDetails {
  storageLimit: number;
  storageUsed: number;
}

export interface FolderItem {
  id: string;
  folderName: string;
  ownerName: string;
  creationTime: string;
}

export interface FileItem {
  id: string;
  name: string;
  ownerName: string;
  creationTime: string;
}

export interface FolderContents {
  id: string | null;
  allFolders: FolderItem[];
  allFiles: FileItem[];
}

export interface FileReturnDTO {
  url: string;
  id: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  username: string;
  password: string;
  mobile: string;
}

export interface VerifyOtpPayload {
  username: string;
  otp: string;
}

export interface ResetPasswordPayload {
  username: string;
  otp: string;
  newPassword: string;
}

export interface UpdateProfilePayload {
  name: string;
  phoneNumber: string;
}
