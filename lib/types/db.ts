export type GalleryImage = {
  id: string;
  title: string;
  category: string;
  before_url: string;
  after_url: string;
  caption: string | null;
  display_order: number;
  is_visible: boolean;
  created_at: string;
};

export type StaffMember = {
  id: string;
  name: string;
  credential: string;
  title: string;
  bio: string;
  photo_url: string | null;
  booking_url: string | null;
  display_order: number;
  is_visible: boolean;
  created_at: string;
};

export type StaffService = {
  staff_id: string;
  service_id: string;
};

export type StaffMemberWithServices = StaffMember & {
  staff_services: { service_id: string; services: { id: string; name: string } }[];
};

export type DbService = {
  id: string;
  name: string;
  summary: string;
  category: string;
  duration: string | null;
  hero_image_url: string | null;
  display_order: number;
  is_visible: boolean;
  created_at: string;
};

export type ServicePriceLine = {
  id: string;
  service_id: string;
  label: string;
  price: string;
  display_order: number;
};

export type DbServiceWithPrices = DbService & {
  service_price_lines: ServicePriceLine[];
};

export type DbTestimonial = {
  id: string;
  quote: string;
  author: string;
  photo_url: string | null;
  is_visible: boolean;
  display_order: number;
  created_at: string;
};

export type NewsletterSend = {
  id: string;
  campaign_name: string;
  subject: string;
  resend_broadcast_id: string;
  sent_at: string | null;
  open_count: number;
  click_count: number;
  recipient_count: number;
  created_at: string;
};
