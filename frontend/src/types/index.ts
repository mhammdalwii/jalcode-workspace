export interface TeamMember {
  id: number;
  name: string;
  role: string;
  email: string;
}

export interface Project {
  team_member_id: number;
  client_id: number;
  id: number;
  title: string;
  category: string;
  status: string;
  pic?: TeamMember;
  client?: Client;
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

export interface Mentee {
  id: number;
  name: string;
  email?: string;
  program: string;
  status: string;
  mentor_id: number;
  mentor?: {
    name: string;
    role: string;
  };
}
