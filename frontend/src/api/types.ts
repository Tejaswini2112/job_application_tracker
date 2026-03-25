export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type Application = {
  id: string;
  companyName: string;
  role: string;
  jobLink: string;
  applicationDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type Note = {
  id: string;
  applicationId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export type AnalyticsSummary = {
  totalApplications: number;
  responseRate: number;
  interviewsScheduled: number;
};

export type AuthPayload = {
  token: string;
  user: User;
};
