export interface Usuario {
  username: string;
  password: string;
}

export interface RespuestaAutenticacion {
  statusCode?: number;
  intData?: {
    token?: string;
    message?: string;
    two_factor_enabled?: boolean;
    data?: {
      qr_code?: string;
      secret?: string;
    };
  };
}
