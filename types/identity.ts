/** Demo-only identity model. No real authentication — hackathon role simulation. */

export type UserRole = 'admin' | 'employee';

export interface DemoAdmin {
  id: string;
  name: string;
  role: 'Company Admin';
  company: string;
  email: string;
}

export interface DemoEmployee {
  id: string;
  name: string;
  role: string;
  department: string;
  company: string;
  email: string;
  status: string;
}

export interface DemoIdentity {
  admin: DemoAdmin;
  employee: DemoEmployee;
}
