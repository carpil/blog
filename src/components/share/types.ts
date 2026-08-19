import type { IconName } from "./icons";

export interface CardChip {
  icon: IconName;
  label: string;
}

export interface SeatPassenger {
  name: string;
  photo?: string | null;
}

export interface SeatStack {
  passengers: SeatPassenger[];
  freeSeats: number;
}

export interface CardProps {
  badge: string;
  origin: string;
  destination: string;
  chips: CardChip[];
  personOverline: string;
  personName: string;
  personPhoto?: string | null;
  personVerified?: boolean;
  seatStack?: SeatStack | null;
}

export interface SideBullet {
  icon: IconName;
  text: string;
}

export interface SideProps {
  label: string;
  heading: string;
  body: string;
  bullets: SideBullet[];
}

export interface SharePageProps {
  deepLink: string;
  shareUrl: string;
  shareTitle: string;
  shareText: string;
  shareLabel: string;
  ctaLabel: string;
  captionMobile: string;
  captionDesktop: string;
  card: CardProps;
  side: SideProps;
}
