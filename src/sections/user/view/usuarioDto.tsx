export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: string;
  password: string;
  company?: string;
  avatarUrl?: string;
  isVerified?: boolean;
  status?:string;
}