// Exportar cliente HTTP base
export { default as httpClient } from './http-client';
export type { ApiResponse, ApiError } from './http-client';

// Exportar servicio de autenticación
export { default as authService } from './auth.service';
export type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ActivateAccountRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest
} from './auth.service';

// Exportar servicio de cargas
export { default as loadsService } from './loads.service';
export type {
  Load,
  CreateLoadRequest,
  UpdateLoadRequest,
  LoadFilters,
  LoadsResponse
} from './loads.service';

// Exportar servicio de carriers
export { default as carriersService } from './carriers.service';
export type {
  Carrier,
  Contact,
  CreateCarrierRequest,
  UpdateCarrierRequest,
  CarrierFilters
} from './carriers.service';

// Exportar servicio de waterfalls
export { default as waterfallsService } from './waterfalls.service';
export type {
  WaterfallCarrier,
  CreateWaterfallRequest,
  UpdateWaterfallRequest,
  WaterfallResponse,
  WaterfallFilters
} from './waterfalls.service';
