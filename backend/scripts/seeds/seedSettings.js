// backend/scripts/seeds/seedSettings.js
// Seed script for settings table (group_name schema)

import db from "../../src/config/db.js";

const settings = [
  {
    key: "general.site_name",
    value: "DuhocNB",
    description: "General setting: website name",
    group_name: "general"
  },
  {
    key: "general.site_url",
    value: "https://duhocnb.vn",
    description: "General setting: website url",
    group_name: "general"
  },
  {
    key: "general.site_logo_url",
    value: "https://duhocnb.vn/logo.png",
    description: "General setting: website logo URL",
    group_name: "general"
  },
  {
    key: "general.site_favicon_url",
    value: "https://duhocnb.vn/favicon.ico",
    description: "General setting: website favicon URL",
    group_name: "general"
  },
  {
    key: "general.site_description",
    value: "Nen tang thong tin du hoc Nhat Ban toan dien, cap nhat tin tuc, truong hoc, dieu kien va ho tro.",
    description: "General setting: website description",
    group_name: "general"
  },
  {
    key: "contact.company_full_name",
    value: "Cong ty Co phan DuhocNB",
    description: "Contact setting: full company name",
    group_name: "contact"
  },
  {
    key: "contact.company_short_name",
    value: "DuhocNB",
    description: "Contact setting: short company name",
    group_name: "contact"
  },
  {
    key: "contact.contact_email",
    value: "support@duhocnb.vn",
    description: "Contact setting: contact email",
    group_name: "contact"
  },
  {
    key: "contact.phone",
    value: "+84-123-456-789",
    description: "Contact setting: phone",
    group_name: "contact"
  },
  {
    key: "contact.hotline",
    value: "+84-123-123-123",
    description: "Contact setting: hotline",
    group_name: "contact"
  },
  {
    key: "contact.address",
    value: "So 1, Duong ABC, Quan XYZ, Ha Noi",
    description: "Contact setting: office address",
    group_name: "contact"
  },
  {
    key: "contact.google_map_embed_url",
    value: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4326043693744!2d106.69385131533472!3d10.77536259230029!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f38f9ed887b%3A0x14aded5703768989!2zUXXhuq1uIDEsIFRow6BuaCBwaOG7kSBI4buTIENow60gTWluaCwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1649832458422!5m2!1svi!2s",
    description: "Contact setting: Google Map embed URL",
    group_name: "contact"
  },
  {
    key: "contact.working_hours",
    value: "Thứ 2 - Thứ 6: 8:00 - 18:00\nThứ 7 - Chủ nhật: 9:00 - 17:00",
    description: "Contact setting: working hours",
    group_name: "contact"
  },
  {
    key: "seo.default_title",
    value: "Du hoc Nhat Ban - DuhocNB",
    description: "SEO setting: default page title",
    group_name: "seo"
  },
  {
    key: "seo.default_description",
    value: "Nen tang thong tin du hoc Nhat Ban toan dien, cap nhat tin tuc, truong hoc, dieu kien va ho tro.",
    description: "SEO setting: default meta description",
    group_name: "seo"
  },
  {
    key: "seo.default_og_image",
    value: "https://duhocnb.vn/og-image.jpg",
    description: "SEO setting: default Open Graph image URL",
    group_name: "seo"
  },
  {
    key: "seo.facebook_app_id",
    value: "",
    description: "SEO setting: Facebook App ID",
    group_name: "seo"
  }
];

const run = async () => {
  try {
    for (const setting of settings) {
      await db.query(
        `INSERT INTO settings (key, value, description, group_name)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (key)
         DO UPDATE SET
           value = EXCLUDED.value,
           description = EXCLUDED.description,
           group_name = EXCLUDED.group_name`,
        [setting.key, setting.value, setting.description, setting.group_name]
      );
    }
    console.log("Seeded settings successfully!");
  } catch (err) {
    console.error("Error seeding settings:", err.message);
  }
};

run();
