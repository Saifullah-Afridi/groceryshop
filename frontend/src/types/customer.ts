export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  phone: string;
  password: string;
  address: string;
}

// Admin side
export interface AdminCustomer extends Customer {
  emailVerified: boolean;
  createdAt: string;
}

export interface CustomerInput {
  name: string;
  email: string;
  phone: string;
  address: string;
  password?: string; // required when creating, optional when editing
}
