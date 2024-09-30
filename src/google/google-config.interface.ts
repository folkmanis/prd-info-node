export interface GoogleConfig {
  oAuthLocation: string;
  oAuthRedirect: string;
  scopes: string[];
  mapsApiKey: string;

  web: {
    client_id: string;
    project_id: string;
    auth_uri: string;
    token_uri: string;
    auth_provider_x509_cert_url: string;
    client_secret: string;
  };
}
