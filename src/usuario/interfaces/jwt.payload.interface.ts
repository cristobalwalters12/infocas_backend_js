//aqui se define la interfaz de como sera el payload del token

export interface JwtPayload {
  correo: string;
  contraseña?: string;
}
