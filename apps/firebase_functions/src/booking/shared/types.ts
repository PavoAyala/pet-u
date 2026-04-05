export type ServiceType = "hotel" | "daycare" | "spa" | "vacunas";
export type ArrivalMode = "happy_bus" | "self_arrival";

export interface HappyBusPayload {
  want?: boolean | string;
  zone?: string | null;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  cost?: number;
}

export interface ReservationPayload {
  serviceType: ServiceType;
  petName: string;
  ownerName: string;
  petSize?: string | null;
  vaccineType?: string | null;
  happyBus?: HappyBusPayload;
  checkin: string;
  checkout?: string;
  totalEstimado: number;
  appointmentTime?: string | null;
  checkinTime?: string | null;
  checkoutTime?: string | null;
  mandatoryBathCost?: number | null;
}
