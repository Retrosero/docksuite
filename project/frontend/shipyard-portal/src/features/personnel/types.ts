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
  firstName: string;
  lastName: string;
  gender: string;
  branch: string;
  birthDate: string | null;
  reportsTo: string;
  companyEmail: string;
  emergencyPhone: string;
  currentAddress: string;
  permanentAddress: string;
  shipyardTeam: string;
  shipyardSpecialty: string;
};

export type PersonnelCreateInput = {
  employeeName: string;
  firstName: string;
  lastName: string;
  company: string;
  status: string;
  gender: string;
  department: string;
  designation: string;
  branch: string;
  joinDate: string;
  birthDate: string;
  phone: string;
  emergencyPhone: string;
  companyEmail: string;
  email: string;
  currentAddress: string;
  permanentAddress: string;
  reportsTo: string;
  shipyardTeam: string;
  shipyardSpecialty: string;
};
