// frontend/src/types/api.ts (UPDATED)

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
  
  date?: string;
  departmentName?: string;
  targetRevenue?: number;
  targetProfitPct?: number;
  revenueAchievement?: number;
  
  employeeName?: string;
  employeeCode?: string;
  position?: string;
  level?: string;
  teamName?: string;
  hourlyRate?: number;
  targetHours?: number;
  hoursAchievement?: number;
}

// Định nghĩa IServiceDetail cho chi tiết đơn hàng
export interface IServiceDetail {
  productName: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  totalAmount: number;
  totalCost: number; // Thêm totalCost vì nó được dùng trong ServicePnlPage
  laborHours: number;
  categoryName: string;
  employeeName: string;
  grossProfit: number;
  grossMargin: number;
}

// ✨ CORRECTED: Định nghĩa IServicePnl chuẩn xác cho trang chi tiết đơn dịch vụ
export interface IServicePnl {
  id: number; // Thêm id vì nó được dùng trong fetch
  orderCode: string;
  orderDate: string;
  completionDate: string;
  customerName: string;
  customerType: string;
  vehicleBrand: string;
  vehicleModel: string;
  licensePlate: string; // Thêm licensePlate
  totalAmount: number;
  totalCost: number;
  grossProfit: number;
  grossMargin: number;
  details: IServiceDetail[];
}

// ✨ CORRECTED: Định nghĩa IEmployeePnl
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

// ✨ CORRECTED: Định nghĩa ITeamPnl
export interface ITeamPnl {
  date: string;
  teamName: string;
  departmentName: string;
  revenue: number;
  cogs: number;
  grossProfit: number;
  grossMargin: number;
  laborHours: number;
  overheadCost: number;
  laborCost: number;
  materialCost: number;
  targetRevenue: number;
  targetProfitPct: number;
  revenueAchievement: number;
  activeEmployees: number;
  totalTransactions: number;
}

export interface IApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ITeamSummary {
  id: number;
  name: string;
  targetRevenue: number;
  targetProfitPct: number;
  employeeCount: number;
  recentRevenue: number;
}

export interface IEmployeeSummary {
  id: number;
  code: string;
  name: string;
  position: string;
  level: string;
  hourlyRate: number;
  targetHours: number;
  recentRevenue: number;
  recentHours: number;
}

export interface IServiceOrderSummary {
  id: number;
  orderCode: string;
  orderDate: string;
  completionDate: string;
  totalAmount: number;
  totalCost: number;
  grossProfit: number;
  grossMargin: number;
  vehicleBrand: string;
  vehicleModel: string;
  licensePlate: string;
  customerName: string;
  customerType: string;
  totalLaborHours: number;
}

export interface IDrillDownContext {
  level: 'garage' | 'department' | 'team' | 'employee' | 'service';
  id?: number | string;
  name?: string;
  breadcrumb: Array<{
    level: string;
    id: number | string;
    name: string;
    path: string;
  }>;
}