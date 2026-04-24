// backend/scripts/seeds/seedStaticPages.js
// Seed script for static_pages table (standardized)

import db from "../../src/config/db.js";

const pages = [
  {
    title: 'Trang chủ',
    slug: 'home',
    hero_title: 'Chào mừng đến với DuhocNB',
    hero_description: 'Nền tảng thông tin du học Nhật Bản toàn diện.',
    meta_title: 'Trang chủ - DuhocNB',
    meta_description: 'Thông tin tổng quan về du học Nhật Bản, trường học, tin tức, điều kiện và hỗ trợ.',
    type: 'static',
    status: 'published',
  },
  {
    title: 'Về chúng tôi',
    slug: 'about',
    hero_title: 'Về DuhocNB',
    hero_description: 'Sứ mệnh, tầm nhìn và đội ngũ của chúng tôi.',
    meta_title: 'Về chúng tôi - DuhocNB',
    meta_description: 'Giới thiệu về DuhocNB, đội ngũ sáng lập và giá trị cốt lõi.',
    type: 'static',
    status: 'published',
  },
  {
    title: 'Danh sách trường Nhật ngữ',
    slug: 'schools',
    hero_title: 'Trường Nhật ngữ',
    hero_description: 'Tìm kiếm và khám phá các trường Nhật ngữ uy tín.',
    meta_title: 'Danh sách trường Nhật ngữ - DuhocNB',
    meta_description: 'Danh sách các trường Nhật ngữ, thông tin chi tiết, đánh giá và liên hệ.',
    type: 'static',
    status: 'published',
  },
  {
    title: 'Điều kiện du học',
    slug: 'conditions',
    hero_title: 'Điều kiện du học Nhật Bản',
    hero_description: 'Tìm hiểu các điều kiện, thủ tục và hồ sơ cần thiết.',
    meta_title: 'Điều kiện du học - DuhocNB',
    meta_description: 'Điều kiện, thủ tục, hồ sơ và kinh nghiệm du học Nhật Bản.',
    type: 'static',
    status: 'published',
  },
  {
    title: 'Tin tức',
    slug: 'news',
    hero_title: 'Tin tức du học',
    hero_description: 'Cập nhật tin tức mới nhất về du học Nhật Bản.',
    meta_title: 'Tin tức - DuhocNB',
    meta_description: 'Tin tức, sự kiện, thông báo và xu hướng du học Nhật Bản.',
    type: 'static',
    status: 'published',
  },
  {
    title: 'Liên hệ',
    slug: 'contact',
    hero_title: 'Liên hệ với DuhocNB',
    hero_description: 'Gửi câu hỏi, góp ý hoặc yêu cầu hỗ trợ.',
    meta_title: 'Liên hệ - DuhocNB',
    meta_description: 'Thông tin liên hệ, hỗ trợ và phản hồi từ DuhocNB.',
    type: 'static',
    status: 'published',
  },
  {
    title: 'Chính sách bảo mật',
    slug: 'privacy-policy',
    hero_title: 'Chính sách bảo mật',
    hero_description: 'Cam kết bảo mật thông tin người dùng.',
    meta_title: 'Chính sách bảo mật - DuhocNB',
    meta_description: 'Chính sách bảo mật, quyền riêng tư và bảo vệ dữ liệu cá nhân.',
    type: 'static',
    status: 'published',
  },
];


const run = async () => {
  try {
    for (const page of pages) {
      await db.query(
        `INSERT INTO static_pages (title, slug, hero_title, hero_description, meta_title, meta_description, type, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (slug) DO NOTHING`,
        [
          page.title,
          page.slug,
          page.hero_title,
          page.hero_description,
          page.meta_title,
          page.meta_description,
          page.type,
          page.status,
        ]
      );
    }
    console.log('✅ Seeded static_pages successfully!');
  } catch (err) {
    console.error('❌ Error seeding static_pages:', err.message);
  }
};

run();
