export interface TeamMember {
  id: number;
  name: string;
  role: string;
  email: string;
}

export interface Project {
  team_members?: TeamMember[];
  team_member_id?: number;
  client_id: number;
  id: number;
  title: string;
  category: string;
  status: string;
  pic?: TeamMember;
  client?: Client;
  tasks?: Task[];
  attachments?: Attachment[];
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

export interface Task {
  id: number;
  project_id: number;
  title: string;
  is_done: boolean;
}

export interface Attachment {
  id: number;
  project_id: number;
  file_name: string;
  file_url: string;
  file_type: string;
  created_at: string;
}

export interface ActivityLog {
  id: number;
  user_id: number;
  user: TeamMember;
  action: string;
  target: string;
  created_at: string;
}

export interface Credential {
  id: number;
  client_id: number;
  type: string;
  url: string;
  username: string;
  password: string; // yang ini sudah versi Decrypt (asli)
  expiry_date: string;
  notes: string;
  created_at: string;
}

export interface ContentPlan {
  id: number;
  title: string;
  platform: string;
  status: string; // "Ide", "Drafting", "Review", "Terjadwal", "Publish"
  publish_date: string | null;
  pics: TeamMember[];
  notes: string;
  created_at: string;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  project_id: number;
  project_title: string;
  client_name: string;
  amount: number;
  status: string; // "Unpaid", "Paid", "Overdue"
  issue_date: string;
  due_date: string;
  service_type: string;
  notes: string;
  created_at: string;
}
