// frontend/src/types/api.ts
export interface IUser {
  id: number;
  username: string;
  fullName: string;
  role: string;
  createdAt: string;
}

export interface IAuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: IUser;
  };
}

export interface IPnlSummary {
  totalRevenue: number;
  totalCogs: number;
  grossProfit: number;
  grossMargin: number;
  totalLaborHours: number;
}

export interface IDepartmentPerformance {
  name: string;
  targetRevenue: number;
  actualRevenue: number;
  grossProfit: number;
  grossMargin: number;
  achievement: number;
}

export interface ICustomerTypeRevenue {
  type: string;
  revenue: number;
  orderCount: number;
  percentage: number;
}

export interface ICategoryRevenue {
  name: string;
  revenue: number;
  grossProfit: number;
  percentage: number;
}

export interface IOverview {
  period: string;
  startDate: string;
  endDate: string;
  summary: IPnlSummary;
  departmentPerformance: IDepartmentPerformance[];
  customerTypeRevenue: ICustomerTypeRevenue[];
  categoryRevenue: ICategoryRevenue[];
}

export interface IPnlData {
  period: string;
  revenue: number;
  cogs: number;
  grossProfit: number;
  grossMargin: number;
  laborCost: number;
  materialCost: number;
  overheadCost: number;
  laborHours: number;
}

export interface IServiceDetail {
  productName: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  totalAmount: number;
  totalCost: number;
  laborHours: number;
  categoryName: string;
  employeeName: string;
  grossProfit: number;
  grossMargin: number;
}

export interface IServicePnl {
  orderCode: string;
  orderDate: string;
  completionDate: string;
  customerName: string;
  customerType: string;
  vehicleBrand: string;
  vehicleModel: string;
  totalAmount: number;
  totalCost: number;
  grossProfit: number;
  grossMargin: number;
  details: IServiceDetail[];
}

export interface IEmployeePnl {
  date: string;
  employeeName: string;
  employeeCode: string;
  position: string;
  level: string;
  departmentName: string;
  teamName: string;
  revenue: number;
  cogs: number;
  grossProfit: number;
  grossMargin: number;
  laborHours: number;
  overheadCost: number;
  hourlyRate: number;
  targetHours: number;
  hoursAchievement: number;
  laborCost: number;
}

export interface IApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
