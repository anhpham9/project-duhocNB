import db from "../../src/config/db.js";

const run = async () => {
    try {
        // Get categories and users first
        const categoriesResult = await db.query('SELECT id, slug FROM categories ORDER BY id');
        const usersResult = await db.query('SELECT id, username FROM users ORDER BY id');

        if (categoriesResult.rows.length === 0) {
            console.log("❌ No categories found. Please seed categories first.");
            return;
        }

        if (usersResult.rows.length === 0) {
            console.log("❌ No users found. Please seed users first.");
            return;
        }

        const categories = categoriesResult.rows;
        const users = usersResult.rows;

        // Sample news data
        const newsData = [
            {
                title: 'Hướng dẫn đầy đủ về du học Nhật Bản năm 2024',
                slug: 'huong-dan-day-du-ve-du-hoc-nhat-ban-nam-2024',
                content: `
                <h2>Giới thiệu về du học Nhật Bản</h2>
                <p>Du học Nhật Bản đang trở thành một xu hướng phổ biến trong giới trẻ Việt Nam. Với nền giáo dục chất lượng cao, văn hóa độc đáo và cơ hội việc làm tốt, Nhật Bản là điểm đến lý tưởng cho những ai muốn trải nghiệm môi trường học tập quốc tế.</p>
                
                <h3>Ưu điểm của du học Nhật Bản</h3>
                <ul>
                <li>Nền giáo dục tiên tiến, chất lượng cao</li>
                <li>Cơ hội học tập công nghệ hiện đại</li>
                <li>Văn hóa lâu đời, môi trường an toàn</li>
                <li>Cơ hội việc làm sau khi tốt nghiệp</li>
                </ul>
                
                <h3>Các bước chuẩn bị hồ sơ du học</h3>
                <p>1. <strong>Chuẩn bị tài liệu học tập:</strong> Bằng tốt nghiệp, bảng điểm, chứng chỉ tiếng Nhật (JLPT)</p>
                <p>2. <strong>Tài liệu tài chính:</strong> Sao kê ngân hàng, giấy tờ chứng minh khả năng chi trả</p>
                <p>3. <strong>Hồ sơ cá nhân:</strong> CV, thư động lực, thư giới thiệu</p>
                
                <h3>Chi phí du học Nhật Bản</h3>
                <p>Chi phí du học Nhật Bản dao động từ 15-25 triệu yen/năm, tùy thuộc vào trường học và khu vực sinh sống. Bao gồm:</p>
                <ul>
                <li>Học phí: 800,000 - 1,500,000 yen/năm</li>
                <li>Sinh hoạt phí: 100,000 - 150,000 yen/tháng</li>
                <li>Chi phí ăn uống: 30,000 - 50,000 yen/tháng</li>
                </ul>
                `,
                excerpt: 'Hướng dẫn chi tiết về quy trình du học Nhật Bản năm 2024, từ chuẩn bị hồ sơ đến chi phí và thủ tục.',
                category_slug: 'du-hoc-nhat-ban',
                status: 'published',
                meta_title: 'Du học Nhật Bản 2024: Hướng dẫn đầy đủ từ A-Z',
                meta_description: 'Hướng dẫn chi tiết về du học Nhật Bản 2024, bao gồm thủ tục, chi phí, và cách chuẩn bị hồ sơ thành công.'
            },
            {
                title: 'Top 10 học bổng du học Nhật Bản dành cho sinh viên Việt Nam',
                slug: 'top-10-hoc-bong-du-hoc-nhat-ban-danh-cho-sinh-vien-viet-nam',
                content: `
                <h2>Danh sách học bổng du học Nhật Bản phổ biến</h2>
                
                <h3>1. Học bổng MEXT (Monbukagakusho)</h3>
                <p>Học bổng của Bộ Giáo dục Nhật Bản, hỗ trợ 100% chi phí học tập và sinh hoạt.</p>
                <ul>
                <li>Mức hỗ trợ: 117,000 - 143,000 yen/tháng</li>
                <li>Thời gian: 2-5 năm tùy chương trình</li>
                <li>Điều kiện: GPA 3.0 trở lên, IELTS 6.0+</li>
                </ul>
                
                <h3>2. Học bổng JASSO</h3>
                <p>Học bổng từ Tổ chức Hỗ trợ Sinh viên Nhật Bản.</p>
                <ul>
                <li>Mức hỗ trợ: 48,000 - 80,000 yen/tháng</li>
                <li>Thời gian: 12 tháng</li>
                <li>Điều kiện: Thành tích học tập tốt</li>
                </ul>
                
                <h3>3. Học bổng từ các trường đại học</h3>
                <p>Nhiều trường đại học Nhật Bản có chương trình học bổng riêng cho sinh viên quốc tế:</p>
                <ul>
                <li>Đại học Tokyo: Giảm 50% học phí</li>
                <li>Đại học Waseda: Hỗ trợ 200,000 - 300,000 yen/năm</li>
                <li>Đại học Kyoto: Miễn giảm học phí đến 100%</li>
                </ul>
                
                <h3>Cách nộp hồ sơ học bổng</h3>
                <p>Hầu hết học bổng yêu cầu:</p>
                <ul>
                <li>Đơn đăng ký (tiếng Nhật hoặc tiếng Anh)</li>
                <li>Bảng điểm và bằng tốt nghiệp</li>
                <li>Thư giới thiệu từ giáo viên/giảng viên</li>
                <li>Kế hoạch học tập chi tiết</li>
                <li>Chứng chỉ tiếng Nhật (JLPT N2 trở lên)</li>
                </ul>
                `,
                excerpt: 'Tổng hợp 10 học bổng du học Nhật Bản hấp dẫn nhất dành cho sinh viên Việt Nam với mức hỗ trợ lên đến 100%.',
                category_slug: 'hoc-bong',
                status: 'published',
                meta_title: 'Top 10 học bổng du học Nhật Bản cho sinh viên Việt Nam 2024',
                meta_description: 'Danh sách học bổng du học Nhật Bản tốt nhất cho sinh viên Việt Nam, bao gồm MEXT, JASSO và học bổng trường học.'
            },
            {
                title: 'Kinh nghiệm sống và học tập tại Tokyo - Chia sẻ từ du học sinh',
                slug: 'kinh-nghiem-song-va-hoc-tap-tai-tokyo-chia-se-tu-du-hoc-sinh',
                content: `
                <h2>Cuộc sống tại Tokyo qua góc nhìn du học sinh</h2>
                
                <h3>Nhà ở và sinh hoạt</h3>
                <p>Tokyo là thành phố đắt đỏ nhưng cũng có nhiều lựa chọn nhà ở phù hợp với sinh viên:</p>
                <ul>
                <li><strong>Ký túc xá trường học:</strong> 30,000-50,000 yen/tháng</li>
                <li><strong>Share house:</strong> 40,000-70,000 yen/tháng</li>
                <li><strong>Apartment riêng:</strong> 60,000-100,000 yen/tháng</li>
                </ul>
                
                <h3>Giao thông</h3>
                <p>Hệ thống giao thông công cộng ở Tokyo rất phát triển:</p>
                <ul>
                <li>JR Pass cho sinh viên: Giảm giá đáng kể</li>
                <li>Thẻ IC card (Suica/Pasmo): Tiện lợi và nhanh chóng</li>
                <li>Xe đạp: Phương tiện phổ biến cho quãng đường ngắn</li>
                </ul>
                
                <h3>Ăn uống</h3>
                <p>Chi phí ăn uống có thể tiết kiệm nếu biết cách:</p>
                <ul>
                <li>Nấu ăn tại nhà: 20,000-30,000 yen/tháng</li>
                <li>Ăn tại các cửa hàng tiện lợi: 500-800 yen/bữa</li>
                <li>Nhà hàng sinh viên: 300-500 yen/bữa</li>
                </ul>
                
                <h3>Học tập và part-time</h3>
                <p>Kinh nghiệm học tập hiệu quả:</p>
                <ul>
                <li>Tham gia câu lạc bộ và hoạt động ngoại khóa</li>
                <li>Làm part-time để cải thiện tiếng Nhật và kiếm thêm thu nhập</li>
                <li>Kết bạn với sinh viên Nhật Bản để luyện tập ngôn ngữ</li>
                </ul>
                
                <h3>Tips sinh hoạt hữu ích</h3>
                <ul>
                <li>Học cách tách rác theo quy định Nhật Bản</li>
                <li>Mua sắm tại 100 yen shop để tiết kiệm</li>
                <li>Sử dụng app dự báo thời tiết và giao thông</li>
                <li>Tham gia các festival và sự kiện địa phương</li>
                </ul>
                `,
                excerpt: 'Kinh nghiệm thực tế về cuộc sống du học sinh tại Tokyo, từ nhà ở, ăn uống đến học tập và làm thêm.',
                category_slug: 'kinh-nghiem-du-hoc',
                status: 'published',
                meta_title: 'Kinh nghiệm sống tại Tokyo - Chia sẻ từ du học sinh Việt Nam',
                meta_description: 'Kinh nghiệm thực tế về cuộc sống du học sinh tại Tokyo, bao gồm nhà ở, giao thông, ăn uống và học tập.'
            },
            {
                title: 'Các trường Nhật ngữ tốt nhất tại Nhật Bản năm 2024',
                slug: 'cac-truong-nhat-ngu-tot-nhat-tai-nhat-ban-nam-2024',
                content: `
                <h2>Top trường Nhật ngữ uy tín tại Nhật Bản</h2>
                
                <h3>1. Trường Nhật ngữ ISI Tokyo</h3>
                <p>Một trong những trường Nhật ngữ lớn nhất và uy tín nhất tại Tokyo.</p>
                <ul>
                <li><strong>Địa điểm:</strong> Takadanobaba, Tokyo</li>
                <li><strong>Học phí:</strong> 800,000 yen/năm</li>
                <li><strong>Đặc điểm:</strong> Chương trình đa dạng, hỗ trợ tư vấn du học</li>
                <li><strong>Tỷ lệ visa:</strong> 95%</li>
                </ul>
                
                <h3>2. Human Academy Japanese Language School</h3>
                <p>Trường có mạng lưới rộng khắp Nhật Bản với nhiều cơ sở.</p>
                <ul>
                <li><strong>Địa điểm:</strong> Tokyo, Osaka, Yokohama</li>
                <li><strong>Học phí:</strong> 750,000 yen/năm</li>
                <li><strong>Đặc điểm:</strong> Chương trình linh hoạt, lớp học nhỏ</li>
                <li><strong>Tỷ lệ visa:</strong> 92%</li>
                </ul>
                
                <h3>3. Intercultural Institute of Japan</h3>
                <p>Trường chuyên về giao lưu văn hóa quốc tế.</p>
                <ul>
                <li><strong>Địa điểm:</strong> Akihabara, Tokyo</li>
                <li><strong>Học phí:</strong> 720,000 yen/năm</li>
                <li><strong>Đặc điểm:</strong> Môi trường đa văn hóa, giáo viên native</li>
                <li><strong>Tỷ lệ visa:</strong> 90%</li>
                </ul>
                
                <h3>Tiêu chí chọn trường Nhật ngữ</h3>
                <ul>
                <li><strong>Tỷ lệ cấp visa:</strong> Nên chọn trường có tỷ lệ trên 85%</li>
                <li><strong>Chương trình học:</strong> Phù hợp với mục tiêu (du học, việc làm, JLPT)</li>
                <li><strong>Vị trí địa lý:</strong> Thuận tiện giao thông và sinh hoạt</li>
                <li><strong>Chi phí:</strong> Phù hợp với ngân sách gia đình</li>
                <li><strong>Hỗ trợ sinh viên:</strong> Tư vấn ký túc xá, part-time, du học</li>
                </ul>
                
                <h3>Quy trình đăng ký</h3>
                <ol>
                <li>Liên hệ tư vấn và chọn trường phù hợp</li>
                <li>Chuẩn bị hồ sơ theo yêu cầu của trường</li>
                <li>Nộp hồ sơ đăng ký (thường 6 tháng trước khi nhập học)</li>
                <li>Nhận kết quả và COE (Certificate of Eligibility)</li>
                <li>Nộp hồ sơ xin visa tại Lãnh sự quán Nhật Bản</li>
                </ol>
                `,
                excerpt: 'Danh sách các trường Nhật ngữ uy tín nhất tại Nhật Bản với tỷ lệ visa cao và chương trình học chất lượng.',
                category_slug: 'du-hoc-nhat-ban',
                status: 'draft',
                meta_title: 'Top trường Nhật ngữ tốt nhất tại Nhật Bản 2024',
                meta_description: 'Tổng hợp các trường Nhật ngữ uy tín tại Nhật Bản với tỷ lệ visa cao và chương trình học chất lượng.'
            },
            {
                title: 'Thủ tục xin visa du học Nhật Bản - Hướng dẫn chi tiết 2024',
                slug: 'thu-tuc-xin-visa-du-hoc-nhat-ban-huong-dan-chi-tiet-2024',
                content: `
                <h2>Quy trình xin visa du học Nhật Bản</h2>
                
                <h3>Bước 1: Chuẩn bị hồ sơ cơ bản</h3>
                <ul>
                <li>Đơn xin visa (mẫu của Lãnh sự quán)</li>
                <li>Hộ chiếu còn hiệu lực trên 6 tháng</li>
                <li>Ảnh 4x3cm (nền trắng, chụp trong vòng 6 tháng)</li>
                <li>Certificate of Eligibility (COE) gốc từ trường học</li>
                </ul>
                
                <h3>Bước 2: Hồ sơ học tập</h3>
                <ul>
                <li>Bằng tốt nghiệp và bảng điểm (có công chứng, hợp pháp hóa)</li>
                <li>Chứng chỉ tiếng Nhật (JLPT) hoặc giấy chứng nhận học tiếng Nhật</li>
                <li>Kế hoạch học tập tại Nhật Bản</li>
                </ul>
                
                <h3>Bước 3: Hồ sơ tài chính</h3>
                <ul>
                <li>Sao kê tài khoản ngân hàng 6 tháng gần nhất</li>
                <li>Giấy xác nhận thu nhập của người bảo lãnh</li>
                <li>Sổ hộ khẩu và giấy khai sinh (chứng minh mối quan hệ)</li>
                <li>Cam kết bảo lãnh tài chính</li>
                </ul>
                
                <h3>Thời gian xử lý</h3>
                <p>Visa du học Nhật Bản thường được xử lý trong vòng 5-7 ngày làm việc. Tuy nhiên, nên nộp hồ sơ sớm để có thời gian bổ sung nếu cần.</p>
                
                <h3>Lệ phí visa</h3>
                <ul>
                <li>Visa đơn lần: 550,000 VND</li>
                <li>Visa nhiều lần: 880,000 VND</li>
                </ul>
                
                <h3>Lưu ý quan trọng</h3>
                <ul>
                <li>Tất cả giấy tờ phải được dịch sang tiếng Nhật hoặc tiếng Anh</li>
                <li>Giấy tờ từ Việt Nam cần công chứng và hợp pháp hóa lãnh sự</li>
                <li>COE chỉ có hiệu lực 3 tháng từ ngày cấp</li>
                <li>Không được làm việc trong 28 ngày đầu sau khi nhập cảnh</li>
                </ul>
                
                <h3>Nguyên nhân thường bị từ chối visa</h3>
                <ul>
                <li>Hồ sơ không đầy đủ hoặc có sai sót</li>
                <li>Tài chính không đủ đảm bảo</li>
                <li>Mục đích du học không rõ ràng</li>
                <li>Có tiền sử vi phạm pháp luật</li>
                <li>Không thể chứng minh mối quan hệ với người bảo lãnh</li>
                </ul>
                `,
                excerpt: 'Hướng dẫn chi tiết thủ tục xin visa du học Nhật Bản, từ chuẩn bị hồ sơ đến nộp đơn tại Lãnh sự quán.',
                category_slug: 'tu-van-du-hoc',
                status: 'draft',
                meta_title: 'Thủ tục xin visa du học Nhật Bản 2024 - Hướng dẫn chi tiết',
                meta_description: 'Hướng dẫn đầy đủ về thủ tục xin visa du học Nhật Bản, bao gồm hồ sơ cần thiết, thời gian xử lý và lưu ý quan trọng.'
            }
        ];

        // Insert news
        for (const news of newsData) {
            // Find category ID by slug
            const category = categories.find(c => c.slug === news.category_slug);
            if (!category) {
                console.log(`⚠️ Category '${news.category_slug}' not found, skipping news: ${news.title}`);
                continue;
            }

            // Use first user as author (usually superadmin)
            const authorId = users[0].id;

            try {
                await db.query(`
                    INSERT INTO news (
                        title, slug, content, excerpt, category_id, author_id, 
                        status, meta_title, meta_description
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    ON CONFLICT (slug, category_id) DO NOTHING
                `, [
                    news.title,
                    news.slug,
                    news.content,
                    news.excerpt,
                    category.id,
                    authorId,
                    news.status,
                    news.meta_title,
                    news.meta_description
                ]);

                console.log(`✅ News created: ${news.title}`);

                // Initialize view stats for each news
                const newsResult = await db.query(
                    'SELECT id FROM news WHERE slug = $1 AND category_id = $2', 
                    [news.slug, category.id]
                );
                
                if (newsResult.rows.length > 0) {
                    const newsId = newsResult.rows[0].id;
                    await db.query(
                        'INSERT INTO news_view_stats (news_id, view_count) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                        [newsId, Math.floor(Math.random() * 500) + 10] // Random view count between 10-500
                    );
                }

            } catch (error) {
                console.log(`⚠️ Error creating news '${news.title}': ${error.message}`);
            }
        }

        console.log("✅ News seeded successfully");
        
    } catch (err) {
        console.error("❌ News seed error:", err.message);
    }
};

run();