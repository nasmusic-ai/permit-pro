export type Barangay = string;
export type Municipality = string;

export interface Location {
  municipality: Municipality;
  barangay: Barangay;
  city?: string;
  province?: string;
  zipCode?: string;
}