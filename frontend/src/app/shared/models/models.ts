export interface Track {
  TrackId: number;
  Name: string;
  Composer?: string;
  UnitPrice: number;
  Milliseconds: number;
  GenreName?: string;
  AlbumTitle?: string;
  ArtistName?: string;
}

export interface Genre {
  GenreId: number;
  Name: string;
}

export interface CartItem extends Track {
  qty: number;
}

export interface PurchaseItem {
  track_id: number;
  quantity: number;
}

export interface PurchaseRequest {
  items: PurchaseItem[];
  billing_address: string;
  billing_city: string;
  billing_country: string;
}

export interface InvoiceLine {
  InvoiceLineId: number;
  TrackId: number;
  UnitPrice: number;
  Quantity: number;
  track_name?: string;
}

export interface Invoice {
  InvoiceId: number;
  InvoiceDate: string;
  Total: number;
  BillingAddress: string;
  BillingCity: string;
  BillingCountry: string;
  items: InvoiceLine[];
}

export interface User {
  id: number;
  email: string;
  role: string;
  customer_id?: number;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}
