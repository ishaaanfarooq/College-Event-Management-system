export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "student";
  canCreateEvent?: boolean;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  status: "published" | "draft" | "cancelled" | "pending_review";
  maxCapacity: number;
  applications: any[];
  participants: string[];
  createdBy: User;
  image?: string;
  registrationDeadline?: string;
  totalViewTime?: number;
}

export interface Application {
  _id: string;
  event: string | Event;
  user: string | User;
  status: "pending" | "approved" | "rejected";
  appliedAt: string;
}
