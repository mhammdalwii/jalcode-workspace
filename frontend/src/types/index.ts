export interface TeamMember {
  id: number;
  name: string;
  role: string;
  email: string;
}

export interface Project {
  id: number;
  title: string;
  category: string;
  status: string;
  pic?: TeamMember;
}

export interface Client {
  id: number;
  company: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at?: string;
}
