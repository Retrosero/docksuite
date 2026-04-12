export type PagedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type PersonnelListQuery = {
  search: string;
  page: number;
  pageSize: number;
};

export type PersonnelListItem = {
  id: string;
  fullName: string;
  status: string;
  designation: string;
  department: string;
  company: string;
  joinDate: string | null;
  phone: string;
  email: string;
};

export type PersonnelDetail = PersonnelListItem & {
  reportsTo: string;
  shipyardTeam: string;
  shipyardSpecialty: string;
};

export type PersonnelCreateInput = {
  employeeName: string;
  firstName: string;
  company: string;
  status: string;
  department: string;
  designation: string;
  joinDate: string;
  phone: string;
  email: string;
  shipyardTeam: string;
  shipyardSpecialty: string;
};
