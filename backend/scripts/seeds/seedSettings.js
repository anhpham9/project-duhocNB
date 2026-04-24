// backend/scripts/seeds/seedSettings.js
// Seed script for settings table (standardized)

import db from "../../src/config/db.js";

const settings = [
  {
    key: 'site_name',
    value: 'DuhocNB',
    description: 'Tên website hiển thị ở tiêu đề và các vị trí chính.'
  },
  {
    key: 'site_logo_url',
    value: 'https://duhocnb.vn/logo.png',
    description: 'URL logo chính của website.'
  },
  {
    key: 'contact_email',
    value: 'support@duhocnb.vn',
    description: 'Email liên hệ chính.'
  },
  {
    key: 'contact_phone',
    value: '+84-123-456-789',
    description: 'Số điện thoại liên hệ chính.'
  },
  {
    key: 'hotline',
    value: '+84-123-123-123',
    description: 'Số điện thoại liên hệ hotline.'
  },
  {
    key: 'facebook_url',
    value: 'https://facebook.com/duhocnb',
    description: 'Fanpage Facebook.'
  },
  {
    key: 'zalo_url',
    value: 'https://zalo.me/duhocnb',
    description: 'Zalo Official.'
  },
  {
    key: 'address',
    value: 'Số 1, Đường ABC, Quận XYZ, Hà Nội',
    description: 'Địa chỉ văn phòng chính.'
  },
  {
    key: 'seo_default_title',
    value: 'Du học Nhật Bản - DuhocNB',
    description: 'Tiêu đề SEO mặc định.'
  },
  {
    key: 'seo_default_description',
    value: 'Nền tảng thông tin du học Nhật Bản toàn diện, cập nhật tin tức, trường học, điều kiện và hỗ trợ.',
    description: 'Mô tả SEO mặc định.'
  },
  {
    key: 'maintenance_mode',
    value: 'off',
    description: 'Bật/tắt chế độ bảo trì (on/off).'
  }
];


const run = async () => {
  try {
    for (const setting of settings) {
      await db.query(
        `INSERT INTO settings (key, value, description)
         VALUES ($1, $2, $3)
         ON CONFLICT (key) DO NOTHING`,
        [setting.key, setting.value, setting.description]
      );
    }
    console.log('✅ Seeded settings successfully!');
  } catch (err) {
    console.error('❌ Error seeding settings:', err.message);
  }
};

run();
