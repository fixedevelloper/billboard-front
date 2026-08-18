import axios, { AxiosError } from "axios";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// Le JWT vit dans un cookie HttpOnly posé par le backend (voir AuthController /login) : il n'est
// jamais lisible en JS, donc jamais injecté manuellement dans un header Authorization. Le
// navigateur l'envoie tout seul sur chaque requête grâce à withCredentials.
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Miroir de com.cscreativ.billboard.shared.api.dto.ErrorResponseDto
interface ErrorResponseDto {
  status: number;
  error: string;
  message: string;
  timestamp: string;
}

export function extractErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ErrorResponseDto>;
    return axiosError.response?.data?.message ?? fallback;
  }
  return fallback;
}

// ---------------------------------------------------------------------------
// user / auth
// ---------------------------------------------------------------------------

// Miroir de com.cscreativ.billboard.user.api.request.RegisterRequest
export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

// Miroir de com.cscreativ.billboard.user.api.response.UserResponse
export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
}

export async function registerUser(input: RegisterInput): Promise<UserResponse> {
  const response = await apiClient.post<UserResponse>("/api/v1/auth/register", input, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
}

// Miroir de com.cscreativ.billboard.user.api.request.LoginRequest
export interface LoginInput {
  email: string;
  password: string;
}

// Miroir de com.cscreativ.billboard.user.api.response.LoginResponse. Ne contient jamais le JWT
// lui-même : le token part dans un cookie HttpOnly que le frontend ne lit jamais (voir api client
// plus haut). Ces champs ne sont que des identifiants, pas des secrets.
export interface SessionUser {
  userId: string;
  email: string;
  advertiserId: string | null;
  ownerId: string | null;
  mediaBuyerId: string | null;
  adminId: string | null;
}

export async function loginUser(input: LoginInput): Promise<SessionUser> {
  const response = await apiClient.post<SessionUser>("/api/v1/auth/login", input, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
}

export async function logoutUser(): Promise<void> {
  await apiClient.post("/api/v1/auth/logout");
}

// Miroir de com.cscreativ.billboard.user.domain.exception.UserNotVerifiedException#getMessage().
// Comparaison de texte volontairement simple (pas de code d'erreur structuré côté backend) :
// permet au formulaire de connexion de proposer un lien vers /verify-email plutôt qu'une
// erreur générique quand le compte n'est pas encore activé.
export const ACCOUNT_NOT_VERIFIED_MESSAGE =
    "Votre compte n'est pas encore vérifié. Consultez votre e-mail pour activer votre compte.";

export async function verifyEmail(token: string): Promise<void> {
  await apiClient.post("/api/v1/auth/verify-email", { token });
}

export async function resendVerificationEmail(email: string): Promise<void> {
  await apiClient.post("/api/v1/auth/resend-verification", { email });
}

/** Reconstitue la session en cours (ex. après rechargement de page) via le cookie HttpOnly. */
export async function getCurrentSession(): Promise<SessionUser | null> {
  try {
    const response = await apiClient.get<SessionUser>("/api/v1/auth/me");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return null;
    }
    throw error;
  }
}

// Miroir de com.cscreativ.billboard.user.api.response.ProfileResponse
export interface ProfileResponse {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string | null;
  status: string;
}

export async function getUserProfile(id: string): Promise<ProfileResponse> {
  const response = await apiClient.get<ProfileResponse>(`/api/v1/users/${id}`);
  return response.data;
}

export interface UpdateUserProfileInput {
  fullName: string;
  phoneNumber?: string;
}

export async function updateUserProfile(id: string, input: UpdateUserProfileInput): Promise<ProfileResponse> {
  const response = await apiClient.put<ProfileResponse>(`/api/v1/users/${id}`, input);
  return response.data;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export async function changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
  await apiClient.put(`/api/v1/users/${userId}/password`, {
    oldPassword: input.currentPassword,
    newPassword: input.newPassword,
  });
}

// Miroir de com.cscreativ.billboard.user.api.response.AdminUserResponse
export interface AdminUserResponse {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string | null;
  status: string;
  roles: string[];
  createdAt: string;
}

export async function listUsers(): Promise<AdminUserResponse[]> {
  const response = await apiClient.get<AdminUserResponse[]>("/api/v1/users");
  return response.data;
}

// ---------------------------------------------------------------------------
// advertiser
// ---------------------------------------------------------------------------

export interface RegisterAdvertiserInput {
  userId: string;
  companyName: string;
  taxNumber: string;
  contactEmail: string;
  contactPhone: string;
}

export interface AdvertiserResponse {
  id: string;
  userId: string;
  companyName: string;
  taxNumber: string;
  contactEmail: string;
  contactPhone: string;
  status: string;
}

export async function registerAdvertiser(input: RegisterAdvertiserInput): Promise<AdvertiserResponse> {
  const response = await apiClient.post<AdvertiserResponse>("/api/v1/advertisers", input);
  return response.data;
}

export async function listAdvertisers(): Promise<AdvertiserResponse[]> {
  const response = await apiClient.get<AdvertiserResponse[]>("/api/v1/advertisers");
  return response.data;
}

export async function getAdvertiser(id: string): Promise<AdvertiserResponse> {
  const response = await apiClient.get<AdvertiserResponse>(`/api/v1/advertisers/${id}`);
  return response.data;
}

export async function verifyAdvertiser(id: string): Promise<void> {
  await apiClient.put(`/api/v1/advertisers/${id}/verify`);
}

// ---------------------------------------------------------------------------
// city
// ---------------------------------------------------------------------------

export interface CityResponse {
  id: string;
  name: string;
  country: string | null;
  latitude: number;
  longitude: number;
}

export interface CreateCityInput {
  name: string;
  country?: string;
  latitude: number;
  longitude: number;
}

export async function getCities(query?: string): Promise<CityResponse[]> {
  const response = await apiClient.get<CityResponse[]>("/api/v1/cities", { params: query ? { query } : undefined });
  return response.data;
}

export async function createCity(input: CreateCityInput): Promise<CityResponse> {
  const response = await apiClient.post<CityResponse>("/api/v1/cities", input);
  return response.data;
}

export async function updateCity(id: string, input: CreateCityInput): Promise<CityResponse> {
  const response = await apiClient.put<CityResponse>(`/api/v1/cities/${id}`, input);
  return response.data;
}

export async function deleteCity(id: string): Promise<void> {
  await apiClient.delete(`/api/v1/cities/${id}`);
}

// ---------------------------------------------------------------------------
// billboard
// ---------------------------------------------------------------------------

export type BillboardType = "DIGITAL" | "STATIC" | "TRIVISION" | "LED_SCREEN";

export interface CreateBillboardInput {
  title: string;
  description?: string;
  type: BillboardType;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  width: number;
  height: number;
  dailyRate: string;
  currency: string;
  ownerId: string;
}

export interface BillboardResponse {
  id: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  address: string | null;
  city: string | null;
  latitude: number;
  longitude: number;
  width: number;
  height: number;
  dailyRate: string;
  currency: string;
  ownerId: string;
}

export async function createBillboard(input: CreateBillboardInput): Promise<BillboardResponse> {
  const response = await apiClient.post<BillboardResponse>("/api/v1/billboards", input);
  return response.data;
}

export async function searchBillboardsByCity(city: string): Promise<BillboardResponse[]> {
  const response = await apiClient.get<BillboardResponse[]>("/api/v1/billboards", { params: { city } });
  return response.data;
}

export async function getBillboard(id: string): Promise<BillboardResponse> {
  const response = await apiClient.get<BillboardResponse>(`/api/v1/billboards/${id}`);
  return response.data;
}

export async function listAllBillboards(): Promise<BillboardResponse[]> {
  const response = await apiClient.get<BillboardResponse[]>("/api/v1/billboards");
  return response.data;
}

export async function getBillboardsByOwner(ownerId: string): Promise<BillboardResponse[]> {
  const response = await apiClient.get<BillboardResponse[]>("/api/v1/billboards", { params: { ownerId } });
  return response.data;
}

export interface UpdateBillboardInput {
  title: string;
  description?: string;
  type: BillboardType;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  width: number;
  height: number;
  dailyRate: string;
  currency: string;
}

export async function updateBillboard(id: string, input: UpdateBillboardInput): Promise<BillboardResponse> {
  const response = await apiClient.put<BillboardResponse>(`/api/v1/billboards/${id}`, input);
  return response.data;
}

export async function deleteBillboard(id: string): Promise<void> {
  await apiClient.delete(`/api/v1/billboards/${id}`);
}

// ---------------------------------------------------------------------------
// booking
// ---------------------------------------------------------------------------

export interface CreateBookingInput {
  billboardId: string;
  advertiserId: string;
  startDate: string; // ISO yyyy-MM-dd
  endDate: string; // ISO yyyy-MM-dd
  dailyRate: string;
  currency: string;
}

export interface BookingResponse {
  id: string;
  billboardId: string;
  advertiserId: string;
  startDate: string;
  endDate: string;
  totalPrice: string;
  currency: string;
  status: string;
  createdAt: string;
}

export async function createBooking(input: CreateBookingInput): Promise<BookingResponse> {
  const response = await apiClient.post<BookingResponse>("/api/v1/bookings", input);
  return response.data;
}

export async function getBooking(id: string): Promise<BookingResponse> {
  const response = await apiClient.get<BookingResponse>(`/api/v1/bookings/${id}`);
  return response.data;
}

export async function confirmBooking(id: string): Promise<void> {
  await apiClient.put(`/api/v1/bookings/${id}/confirm`);
}

export async function cancelBooking(id: string): Promise<void> {
  await apiClient.put(`/api/v1/bookings/${id}/cancel`);
}

export async function getBookingsByAdvertiser(advertiserId: string): Promise<BookingResponse[]> {
  const response = await apiClient.get<BookingResponse[]>(`/api/v1/bookings/advertiser/${advertiserId}`);
  return response.data;
}

export async function getBookingsByBillboard(billboardId: string): Promise<BookingResponse[]> {
  const response = await apiClient.get<BookingResponse[]>(`/api/v1/bookings/billboard/${billboardId}`);
  return response.data;
}

export async function getUnpaidExpirationDays(): Promise<number> {
  const response = await apiClient.get<number>("/api/v1/bookings/unpaid-expiration-days");
  return response.data;
}

export async function listAllBookings(): Promise<BookingResponse[]> {
  const response = await apiClient.get<BookingResponse[]>("/api/v1/bookings");
  return response.data;
}

// ---------------------------------------------------------------------------
// campaign
// ---------------------------------------------------------------------------

export interface CreateCampaignInput {
  bookingId: string;
  advertiserId: string;
  name: string;
  description?: string;
  mediaUrl?: string;
  fileType?: string;
  fileSize?: number;
}

export interface CampaignResponse {
  id: string;
  bookingId: string;
  advertiserId: string;
  name: string;
  description: string | null;
  mediaUrl: string | null;
  fileType: string | null;
  status: string;
  rejectionReason: string | null;
}

export async function createCampaign(input: CreateCampaignInput): Promise<CampaignResponse> {
  const response = await apiClient.post<CampaignResponse>("/api/v1/campaigns", input);
  return response.data;
}

export async function submitCampaign(id: string): Promise<void> {
  await apiClient.post(`/api/v1/campaigns/${id}/submit`);
}

export async function getCampaign(id: string): Promise<CampaignResponse> {
  const response = await apiClient.get<CampaignResponse>(`/api/v1/campaigns/${id}`);
  return response.data;
}

export async function getCampaignsByAdvertiser(advertiserId: string): Promise<CampaignResponse[]> {
  const response = await apiClient.get<CampaignResponse[]>(`/api/v1/campaigns/advertiser/${advertiserId}`);
  return response.data;
}

export async function getCampaignsByBooking(bookingId: string): Promise<CampaignResponse[]> {
  const response = await apiClient.get<CampaignResponse[]>(`/api/v1/campaigns/booking/${bookingId}`);
  return response.data;
}

export async function listAllCampaigns(): Promise<CampaignResponse[]> {
  const response = await apiClient.get<CampaignResponse[]>("/api/v1/campaigns");
  return response.data;
}

// ---------------------------------------------------------------------------
// creative
// ---------------------------------------------------------------------------

export interface SubmitProofInput {
  campaignId: string;
  fileUrl: string;
  width: number;
  height: number;
}

export interface CreativeProofResponse {
  id: string;
  campaignId: string;
  version: number;
  fileUrl: string;
  width: number;
  height: number;
  status: string;
  feedback: string | null;
  createdAt: string;
}

export async function submitCreativeProof(input: SubmitProofInput): Promise<CreativeProofResponse> {
  const response = await apiClient.post<CreativeProofResponse>("/api/v1/creatives/proofs", input);
  return response.data;
}

export async function getCreativeProofsByCampaign(campaignId: string): Promise<CreativeProofResponse[]> {
  const response = await apiClient.get<CreativeProofResponse[]>(`/api/v1/creatives/campaign/${campaignId}/proofs`);
  return response.data;
}

// ---------------------------------------------------------------------------
// contract
// ---------------------------------------------------------------------------

export interface CreateContractInput {
  bookingId: string;
  ownerId: string;
  advertiserId: string;
  termsAndConditions: string;
}

export interface SignContractInput {
  signerName: string;
  ipAddress: string;
}

export interface ContractResponse {
  id: string;
  bookingId: string;
  ownerId: string;
  advertiserId: string;
  termsAndConditions: string;
  status: string;
  isSignedByOwner: boolean;
  isSignedByAdvertiser: boolean;
  createdAt: string;
}

export async function createContract(input: CreateContractInput): Promise<ContractResponse> {
  const response = await apiClient.post<ContractResponse>("/api/v1/contracts", input);
  return response.data;
}

export async function publishContractForSignature(id: string): Promise<void> {
  await apiClient.post(`/api/v1/contracts/${id}/publish`);
}

export async function signContractAsAdvertiser(id: string, input: SignContractInput): Promise<void> {
  await apiClient.post(`/api/v1/contracts/${id}/sign/advertiser`, input);
}

export async function signContractAsOwner(id: string, input: SignContractInput): Promise<void> {
  await apiClient.post(`/api/v1/contracts/${id}/sign/owner`, input);
}

export async function getContract(id: string): Promise<ContractResponse> {
  const response = await apiClient.get<ContractResponse>(`/api/v1/contracts/${id}`);
  return response.data;
}

export async function getContractByBooking(bookingId: string): Promise<ContractResponse> {
  const response = await apiClient.get<ContractResponse>(`/api/v1/contracts/booking/${bookingId}`);
  return response.data;
}

// ---------------------------------------------------------------------------
// payment
// ---------------------------------------------------------------------------

export type PaymentMethod = "CREDIT_CARD" | "MOBILE_MONEY" | "BANK_TRANSFER" | "CREDIT_ACCOUNT" | "FLUTTERWAVE";

export interface InitiatePaymentInput {
  payerId: string;
  referenceId: string;
  amount: string;
  currency: string;
  paymentMethod: PaymentMethod;
  initiatedBy: string;
}

export interface CompletePaymentInput {
  gatewayReference: string;
}

export interface PaymentTransactionResponse {
  id: string;
  payerId: string;
  referenceId: string;
  amount: string;
  currency: string;
  paymentMethod: string;
  status: string;
  gatewayReference: string | null;
  failureReason: string | null;
  initiatedBy: string | null;
  delegated: boolean;
  createdAt: string;
}

export async function initiatePayment(input: InitiatePaymentInput): Promise<PaymentTransactionResponse> {
  const response = await apiClient.post<PaymentTransactionResponse>("/api/v1/payments/initiate", input);
  return response.data;
}

export async function completePayment(id: string, input: CompletePaymentInput): Promise<void> {
  await apiClient.put(`/api/v1/payments/${id}/complete`, input);
}

export interface FlutterwaveCheckoutInput {
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
}

export async function initiateFlutterwaveCheckout(
  paymentId: string,
  input: FlutterwaveCheckoutInput,
): Promise<{ checkoutUrl: string }> {
  const response = await apiClient.post<{ checkoutUrl: string }>(
    `/api/v1/payments/${paymentId}/flutterwave/checkout`,
    input,
  );
  return response.data;
}

export async function getPaymentsByPayer(payerId: string): Promise<PaymentTransactionResponse[]> {
  const response = await apiClient.get<PaymentTransactionResponse[]>(`/api/v1/payments/payer/${payerId}`);
  return response.data;
}

export async function getPaymentsByReference(referenceId: string): Promise<PaymentTransactionResponse[]> {
  const response = await apiClient.get<PaymentTransactionResponse[]>(`/api/v1/payments/reference/${referenceId}`);
  return response.data;
}

export async function listAllPayments(): Promise<PaymentTransactionResponse[]> {
  const response = await apiClient.get<PaymentTransactionResponse[]>("/api/v1/payments");
  return response.data;
}

// ---------------------------------------------------------------------------
// storage
// ---------------------------------------------------------------------------

export interface StoredFileResponse {
  id: string;
  originalFilename: string;
  contentType: string;
  size: number;
  publicUrl: string;
  ownerId: string;
  uploadedAt: string;
}

export async function uploadFile(file: File, ownerId: string): Promise<StoredFileResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("ownerId", ownerId);
  const response = await apiClient.post<StoredFileResponse>("/api/v1/files/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

// ---------------------------------------------------------------------------
// media buyer
// ---------------------------------------------------------------------------

export interface RegisterMediaBuyerInput {
  userId: string;
  companyName: string;
  taxId?: string;
  contactEmail: string;
  phoneNumber?: string;
  creditLimit: string;
}

export interface MediaBuyerResponse {
  id: string;
  userId: string;
  companyName: string;
  taxId: string | null;
  contactEmail: string;
  phoneNumber: string | null;
  creditLimit: string;
  currentSpent: string;
  status: string;
  createdAt: string;
}

export async function registerMediaBuyer(input: RegisterMediaBuyerInput): Promise<MediaBuyerResponse> {
  const response = await apiClient.post<MediaBuyerResponse>("/api/v1/media-buyers", input);
  return response.data;
}

export async function listMediaBuyers(): Promise<MediaBuyerResponse[]> {
  const response = await apiClient.get<MediaBuyerResponse[]>("/api/v1/media-buyers");
  return response.data;
}

export async function getMediaBuyer(id: string): Promise<MediaBuyerResponse> {
  const response = await apiClient.get<MediaBuyerResponse>(`/api/v1/media-buyers/${id}`);
  return response.data;
}

export async function getMediaBuyerByUserId(userId: string): Promise<MediaBuyerResponse> {
  const response = await apiClient.get<MediaBuyerResponse>(`/api/v1/media-buyers/user/${userId}`);
  return response.data;
}

export async function activateMediaBuyer(id: string): Promise<void> {
  await apiClient.put(`/api/v1/media-buyers/${id}/activate`);
}

// ---------------------------------------------------------------------------
// owner
// ---------------------------------------------------------------------------

export interface RegisterOwnerInput {
  userId: string;
  companyName: string;
  registrationNumber?: string;
  contactEmail: string;
  phoneNumber?: string;
  revenueShareRate: string;
}

export interface BillboardOwnerResponse {
  id: string;
  userId: string;
  companyName: string;
  registrationNumber: string | null;
  contactEmail: string;
  phoneNumber: string | null;
  revenueShareRate: string;
  status: string;
  createdAt: string;
}

export async function getOwner(id: string): Promise<BillboardOwnerResponse> {
  const response = await apiClient.get<BillboardOwnerResponse>(`/api/v1/owners/${id}`);
  return response.data;
}

export async function registerOwner(input: RegisterOwnerInput): Promise<BillboardOwnerResponse> {
  const response = await apiClient.post<BillboardOwnerResponse>("/api/v1/owners", input);
  return response.data;
}

export async function getOwnerByUserId(userId: string): Promise<BillboardOwnerResponse> {
  const response = await apiClient.get<BillboardOwnerResponse>(`/api/v1/owners/user/${userId}`);
  return response.data;
}

export async function activateOwner(id: string): Promise<void> {
  await apiClient.put(`/api/v1/owners/${id}/activate`);
}

export async function listOwners(): Promise<BillboardOwnerResponse[]> {
  const response = await apiClient.get<BillboardOwnerResponse[]>("/api/v1/owners");
  return response.data;
}

// ---------------------------------------------------------------------------
// admin
// ---------------------------------------------------------------------------

export type AdminRole = "SUPER_ADMIN" | "MODERATOR" | "SUPPORT" | "FINANCE";

export type AuditAction =
  | "APPROVE_BILLBOARD"
  | "REJECT_BILLBOARD"
  | "VERIFY_ADVERTISER"
  | "SUSPEND_USER"
  | "REFUND_BOOKING";

export interface CreateAdminInput {
  userId: string;
  roles: AdminRole[];
}

export interface AdminResponse {
  id: string;
  userId: string;
  roles: string[];
  active: boolean;
}

export interface LogActionInput {
  action: AuditAction;
  targetEntity: string;
  targetId: string;
  details?: string;
}

export interface AuditLogResponse {
  id: string;
  adminId: string;
  action: string;
  targetEntity: string;
  targetId: string;
  details: string | null;
  timestamp: string;
}

export async function createAdmin(input: CreateAdminInput): Promise<AdminResponse> {
  const response = await apiClient.post<AdminResponse>("/api/v1/admins", input);
  return response.data;
}

export async function logAdminAction(adminId: string, input: LogActionInput): Promise<void> {
  await apiClient.post(`/api/v1/admins/${adminId}/actions`, input);
}

export async function getAuditLogs(adminId: string): Promise<AuditLogResponse[]> {
  const response = await apiClient.get<AuditLogResponse[]>(`/api/v1/admins/${adminId}/audit-logs`);
  return response.data;
}

export async function listAllAuditLogs(): Promise<AuditLogResponse[]> {
  const response = await apiClient.get<AuditLogResponse[]>("/api/v1/admins/audit-logs");
  return response.data;
}

// ---------------------------------------------------------------------------
// installation
// ---------------------------------------------------------------------------

export interface ScheduleInstallationTaskInput {
  campaignId: string;
  billboardId: string;
  technicianId: string;
  scheduledDate: string; // ISO local date-time
}

export interface CompleteInstallationTaskInput {
  photoUrl: string;
  notes?: string;
}

export interface InstallationTaskResponse {
  id: string;
  campaignId: string;
  billboardId: string;
  technicianId: string;
  scheduledDate: string;
  status: string;
  proofPhotoUrl: string | null;
  proofNotes: string | null;
  createdAt: string;
}

export async function scheduleInstallationTask(
  input: ScheduleInstallationTaskInput,
): Promise<InstallationTaskResponse> {
  const response = await apiClient.post<InstallationTaskResponse>("/api/v1/installations", input);
  return response.data;
}

export async function startInstallationTask(id: string): Promise<void> {
  await apiClient.put(`/api/v1/installations/${id}/start`);
}

export async function completeInstallationTask(id: string, input: CompleteInstallationTaskInput): Promise<void> {
  await apiClient.put(`/api/v1/installations/${id}/complete`, input);
}

export async function getInstallationTasksByCampaign(campaignId: string): Promise<InstallationTaskResponse[]> {
  const response = await apiClient.get<InstallationTaskResponse[]>(
    `/api/v1/installations/campaign/${campaignId}`,
  );
  return response.data;
}

// ---------------------------------------------------------------------------
// review
// ---------------------------------------------------------------------------

export interface SubmitReviewInput {
  authorId: string;
  targetId: string;
  rating: number;
  comment?: string;
}

export interface BillboardReviewResponse {
  id: string;
  authorId: string;
  targetId: string;
  rating: number;
  comment: string | null;
  status: string;
  moderationReason: string | null;
  createdAt: string;
}

export async function submitReview(input: SubmitReviewInput): Promise<BillboardReviewResponse> {
  const response = await apiClient.post<BillboardReviewResponse>("/api/v1/reviews", input);
  return response.data;
}

export async function approveReview(id: string): Promise<void> {
  await apiClient.put(`/api/v1/reviews/${id}/approve`);
}

export async function rejectReview(id: string, reason: string): Promise<void> {
  await apiClient.put(`/api/v1/reviews/${id}/reject`, { reason });
}

export async function getPublishedReviewsForTarget(targetId: string): Promise<BillboardReviewResponse[]> {
  const response = await apiClient.get<BillboardReviewResponse[]>(`/api/v1/reviews/target/${targetId}`);
  return response.data;
}

export async function listAllReviews(): Promise<BillboardReviewResponse[]> {
  const response = await apiClient.get<BillboardReviewResponse[]>("/api/v1/reviews");
  return response.data;
}

export async function getAverageRating(targetId: string): Promise<number> {
  const response = await apiClient.get<number>(`/api/v1/reviews/target/${targetId}/average-rating`);
  return response.data;
}

// ---------------------------------------------------------------------------
// reporting
// ---------------------------------------------------------------------------

export type ReportType = "CAMPAIGN_PERFORMANCE" | "BILLBOARD_OCCUPANCY" | "OWNER_REVENUE" | "SYSTEM_ANALYTICS";

// Le backend n'agrège rien automatiquement : c'est l'appelant qui fournit les métriques,
// l'API se contente de persister un instantané.
export interface GenerateReportInput {
  targetId: string;
  type: ReportType;
  startDate: string; // ISO local date-time
  endDate: string; // ISO local date-time
  totalImpressions: number;
  totalInteractions: number;
  totalRevenue: string;
  occupancyRate: string;
}

export interface PerformanceReportResponse {
  id: string;
  targetId: string;
  type: string;
  startDate: string;
  endDate: string;
  totalImpressions: number;
  totalInteractions: number;
  totalRevenue: string;
  occupancyRate: string;
  generatedAt: string;
}

export async function generateReport(input: GenerateReportInput): Promise<PerformanceReportResponse> {
  const response = await apiClient.post<PerformanceReportResponse>("/api/v1/reports/generate", input);
  return response.data;
}

export async function getReportsByTarget(targetId: string): Promise<PerformanceReportResponse[]> {
  const response = await apiClient.get<PerformanceReportResponse[]>(`/api/v1/reports/target/${targetId}`);
  return response.data;
}

// ---------------------------------------------------------------------------
// platform settings
// ---------------------------------------------------------------------------

export type ConfigType = "STRING" | "NUMBER" | "BOOLEAN" | "JSON";

export interface SaveSettingInput {
  key: string;
  value: string;
  description?: string;
  type: ConfigType;
}

export interface SettingResponse {
  key: string;
  value: string;
  description: string | null;
  type: string;
  updatedAt: string;
}

// setSetting() côté backend fait un upsert : même endpoint pour créer et mettre à jour.
export async function saveSetting(input: SaveSettingInput): Promise<SettingResponse> {
  const response = await apiClient.post<SettingResponse>("/api/v1/configs", input);
  return response.data;
}

export async function getAllSettings(): Promise<SettingResponse[]> {
  const response = await apiClient.get<SettingResponse[]>("/api/v1/configs");
  return response.data;
}

// ---------------------------------------------------------------------------
// billboard images
// ---------------------------------------------------------------------------

export interface BillboardImageResponse {
  id: string;
  billboardId: string;
  url: string;
  createdAt: string;
}

export async function addBillboardImage(billboardId: string, fileId: string): Promise<BillboardImageResponse> {
  const response = await apiClient.post<BillboardImageResponse>(`/api/v1/billboards/${billboardId}/images`, {
    fileId,
  });
  return response.data;
}

export async function getBillboardImages(billboardId: string): Promise<BillboardImageResponse[]> {
  const response = await apiClient.get<BillboardImageResponse[]>(`/api/v1/billboards/${billboardId}/images`);
  return response.data;
}

export async function removeBillboardImage(billboardId: string, imageId: string): Promise<void> {
  await apiClient.delete(`/api/v1/billboards/${billboardId}/images/${imageId}`);
}

// ---------------------------------------------------------------------------
// wallet
// ---------------------------------------------------------------------------

export interface WalletResponse {
  id: string;
  userId: string;
  balance: string;
  currency: string;
  updatedAt: string;
}

export interface WalletTransactionResponse {
  id: string;
  walletId: string;
  type: "DEPOSIT" | "WITHDRAWAL";
  amount: string;
  currency: string;
  reference: string | null;
  createdAt: string;
}

export async function getWallet(userId: string, currency = "XOF"): Promise<WalletResponse> {
  const response = await apiClient.get<WalletResponse>(`/api/v1/wallets/user/${userId}`, {
    params: { currency },
  });
  return response.data;
}

// Miroir de com.cscreativ.billboard.wallet.domain.WalletOperationMethod
export type WalletOperationMethod = "MOBILE_MONEY" | "BANK_TRANSFER";
export type WalletOperationType = "DEPOSIT" | "WITHDRAWAL";
export type WalletOperationStatus = "PENDING" | "COMPLETED" | "FAILED";

// Miroir de com.cscreativ.billboard.wallet.api.response.WalletOperationResponse
export interface WalletOperationResponse {
  id: string;
  userId: string;
  type: WalletOperationType;
  method: WalletOperationMethod;
  status: WalletOperationStatus;
  amount: string;
  currency: string;
  phoneNumber: string | null;
  bankAccountHolder: string | null;
  bankIban: string | null;
  bankName: string | null;
  reference: string | null;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformBankAccountResponse {
  accountHolderName: string;
  iban: string;
  bankName: string;
}

export interface DepositInput {
  method: WalletOperationMethod;
  amount: string;
  currency: string;
  phoneNumber?: string;
}

export interface WithdrawalInput {
  method: WalletOperationMethod;
  amount: string;
  currency: string;
  phoneNumber?: string;
  bankAccountHolder?: string;
  bankIban?: string;
  bankName?: string;
}

export async function getPlatformBankDetails(): Promise<PlatformBankAccountResponse> {
  const response = await apiClient.get<PlatformBankAccountResponse>("/api/v1/wallet-operations/bank-details");
  return response.data;
}

export async function initiateDeposit(userId: string, input: DepositInput): Promise<WalletOperationResponse> {
  const response = await apiClient.post<WalletOperationResponse>(`/api/v1/wallet-operations/user/${userId}/deposits`, input);
  return response.data;
}

export async function initiateWithdrawal(userId: string, input: WithdrawalInput): Promise<WalletOperationResponse> {
  const response = await apiClient.post<WalletOperationResponse>(`/api/v1/wallet-operations/user/${userId}/withdrawals`, input);
  return response.data;
}

export async function getWalletOperations(userId: string): Promise<WalletOperationResponse[]> {
  const response = await apiClient.get<WalletOperationResponse[]>(`/api/v1/wallet-operations/user/${userId}`);
  return response.data;
}

export async function completeWalletOperation(id: string): Promise<WalletOperationResponse> {
  const response = await apiClient.put<WalletOperationResponse>(`/api/v1/wallet-operations/${id}/complete`);
  return response.data;
}

export async function failWalletOperation(id: string, reason: string): Promise<WalletOperationResponse> {
  const response = await apiClient.put<WalletOperationResponse>(`/api/v1/wallet-operations/${id}/fail`, { reason });
  return response.data;
}

export async function listAllWalletOperations(): Promise<WalletOperationResponse[]> {
  const response = await apiClient.get<WalletOperationResponse[]>("/api/v1/wallet-operations");
  return response.data;
}

export async function getWalletTransactions(userId: string): Promise<WalletTransactionResponse[]> {
  const response = await apiClient.get<WalletTransactionResponse[]>(`/api/v1/wallets/user/${userId}/transactions`);
  return response.data;
}

// ---------------------------------------------------------------------------
// notification
// ---------------------------------------------------------------------------

export interface NotificationLogResponse {
  id: string;
  recipientId: string;
  destination: string;
  channel: "EMAIL" | "SMS" | "IN_APP" | "WEBHOOK";
  templateCode: string;
  content: string;
  status: string;
  errorMessage: string | null;
  read: boolean;
  sentAt: string | null;
  createdAt: string;
}

export async function getNotificationsByRecipient(recipientId: string): Promise<NotificationLogResponse[]> {
  const response = await apiClient.get<NotificationLogResponse[]>(`/api/v1/notifications/recipient/${recipientId}`);
  return response.data;
}

export async function getUnreadNotificationCount(recipientId: string): Promise<number> {
  const response = await apiClient.get<number>(`/api/v1/notifications/recipient/${recipientId}/unread-count`);
  return response.data;
}

export async function markNotificationAsRead(id: string): Promise<NotificationLogResponse> {
  const response = await apiClient.put<NotificationLogResponse>(`/api/v1/notifications/${id}/read`);
  return response.data;
}

// Le JWT (cookie HttpOnly) est envoyé automatiquement par le navigateur pour ce flux SSE tant que
// l'EventSource est ouvert avec { withCredentials: true } (voir NotificationBell) : plus besoin de
// le passer en paramètre de requête, où il aurait fini dans les logs d'accès et l'historique.
export function getNotificationStreamUrl(recipientId: string): string {
  return `${API_BASE_URL}/api/v1/notifications/stream/${recipientId}`;
}
