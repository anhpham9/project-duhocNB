import db from "../config/db.js";
import { logError } from "../utils/logger.js";

const PUBLIC_VISIBLE_STATUSES = ["active", "partner"];

const fetchSchoolDetailContentById = async (schoolId) => {
    const introResult = await db.query(
        `SELECT short_intro, founding_history, school_philosophy
         FROM school_detail_contents
         WHERE school_id = $1`,
        [schoolId]
    );

    const programOverviewResult = await db.query(
        `SELECT hero_title, hero_description
         FROM school_program_overviews
         WHERE school_id = $1`,
        [schoolId]
    );

    const programCardsResult = await db.query(
        `SELECT id, icon, course_name, course_description, duration_text, price_text, target_text, sort_order, is_active
         FROM school_program_cards
         WHERE school_id = $1
         ORDER BY sort_order ASC, id ASC`,
        [schoolId]
    );

    const admissionOverviewResult = await db.query(
        `SELECT hero_title, hero_description
         FROM school_admission_overviews
         WHERE school_id = $1`,
        [schoolId]
    );

    const admissionCardsResult = await db.query(
        `SELECT id, icon, criterion_name, sort_order, is_active
         FROM school_admission_cards
         WHERE school_id = $1
         ORDER BY sort_order ASC, id ASC`,
        [schoolId]
    );

    const admissionCardIds = admissionCardsResult.rows.map((row) => row.id);
    const admissionItemsResult = admissionCardIds.length > 0
        ? await db.query(
            `SELECT id, admission_card_id, item_text, sort_order
             FROM school_admission_card_items
             WHERE admission_card_id = ANY($1::int[])
             ORDER BY sort_order ASC, id ASC`,
            [admissionCardIds]
        )
        : { rows: [] };

    const facilityOverviewResult = await db.query(
        `SELECT hero_title, hero_description
         FROM school_facility_overviews
         WHERE school_id = $1`,
        [schoolId]
    );

    const facilityCardsResult = await db.query(
        `SELECT id, icon, service_name, content_detail, sort_order, is_active
         FROM school_facility_cards
         WHERE school_id = $1
         ORDER BY sort_order ASC, id ASC`,
        [schoolId]
    );

    const admissionItemsByCardId = new Map();
    for (const item of admissionItemsResult.rows) {
        if (!admissionItemsByCardId.has(item.admission_card_id)) {
            admissionItemsByCardId.set(item.admission_card_id, []);
        }
        admissionItemsByCardId.get(item.admission_card_id).push({
            id: item.id,
            itemText: item.item_text,
            sortOrder: item.sort_order
        });
    }

    const intro = introResult.rows[0] || {};
    const programOverview = programOverviewResult.rows[0] || {};
    const admissionOverview = admissionOverviewResult.rows[0] || {};
    const facilityOverview = facilityOverviewResult.rows[0] || {};

    return {
        intro: {
            shortIntro: intro.short_intro || "",
            foundingHistory: intro.founding_history || "",
            schoolPhilosophy: intro.school_philosophy || ""
        },
        program: {
            heroTitle: programOverview.hero_title || "",
            heroDescription: programOverview.hero_description || "",
            cards: programCardsResult.rows.map((row) => ({
                id: row.id,
                icon: row.icon || "",
                courseName: row.course_name || "",
                courseDescription: row.course_description || "",
                durationText: row.duration_text || "",
                priceText: row.price_text || "",
                targetText: row.target_text || "",
                sortOrder: row.sort_order,
                isActive: row.is_active
            }))
        },
        admission: {
            heroTitle: admissionOverview.hero_title || "",
            heroDescription: admissionOverview.hero_description || "",
            cards: admissionCardsResult.rows.map((row) => ({
                id: row.id,
                icon: row.icon || "",
                criterionName: row.criterion_name || "",
                sortOrder: row.sort_order,
                isActive: row.is_active,
                items: admissionItemsByCardId.get(row.id) || []
            }))
        },
        facility: {
            heroTitle: facilityOverview.hero_title || "",
            heroDescription: facilityOverview.hero_description || "",
            cards: facilityCardsResult.rows.map((row) => ({
                id: row.id,
                icon: row.icon || "",
                serviceName: row.service_name || "",
                contentDetail: row.content_detail || "",
                sortOrder: row.sort_order,
                isActive: row.is_active
            }))
        }
    };
};

export const getPublicSchools = async (req, res) => {
    try {
        const { search, region, type, min_rating } = req.query;
        const values = [];
        const conditions = ["s.status = ANY($1::text[])"];
        values.push(PUBLIC_VISIBLE_STATUSES);

        if (search) {
            values.push(`%${String(search).trim()}%`);
            const p = values.length;
            conditions.push(`(s.name ILIKE $${p} OR s.name_en ILIKE $${p} OR s.location ILIKE $${p})`);
        }

        if (region) {
            values.push(String(region).trim());
            conditions.push(`r.slug = $${values.length}`);
        }

        if (type) {
            values.push(String(type).trim());
            conditions.push(`st.slug = $${values.length}`);
        }

        if (min_rating !== undefined && min_rating !== null && min_rating !== "") {
            values.push(Number(min_rating));
            conditions.push(`s.rating >= $${values.length}`);
        }

        const query = `
            SELECT
                s.id,
                s.name,
                s.name_en,
                s.slug,
                s.location,
                s.phone,
                s.email,
                s.website,
                s.tuition_per_year,
                s.class_size,
                s.visa_success_rate,
                s.intake_months,
                s.features,
                s.status,
                s.logo_url,
                s.thumbnail_url,
                s.rating,
                s.review_count,
                r.name as region_name,
                r.slug as region_slug,
                st.name as type_name,
                st.slug as type_slug
            FROM schools s
            LEFT JOIN regions r ON s.region_id = r.id
            LEFT JOIN school_types st ON s.type_id = st.id
            WHERE ${conditions.join(" AND ")}
            ORDER BY COALESCE(s.rating, 0) DESC, s.review_count DESC, s.id DESC
        `;

        const result = await db.query(query, values);
        res.json({
            success: true,
            data: result.rows,
            total: result.rows.length
        });
    } catch (error) {
        logError("Get public schools failed", error, { query: req.query });
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getPublicSchoolBySlug = async (req, res) => {
    try {
        const slug = String(req.params.slug || "").trim();
        if (!slug) {
            return res.status(400).json({ success: false, message: "Invalid school slug" });
        }

        const result = await db.query(
            `SELECT
                s.id,
                s.name,
                s.name_en,
                s.slug,
                s.location,
                s.phone,
                s.fax,
                s.email,
                s.website,
                s.tuition_per_year,
                s.class_size,
                s.visa_success_rate,
                s.intake_months,
                s.features,
                s.status,
                s.logo_url,
                s.thumbnail_url,
                s.rating,
                s.review_count,
                s.created_at,
                s.updated_at,
                r.name as region_name,
                r.slug as region_slug,
                st.name as type_name,
                st.slug as type_slug
             FROM schools s
             LEFT JOIN regions r ON s.region_id = r.id
             LEFT JOIN school_types st ON s.type_id = st.id
             WHERE s.slug = $1 AND s.status = ANY($2::text[])
             LIMIT 1`,
            [slug, PUBLIC_VISIBLE_STATUSES]
        );

        if (!result.rows.length) {
            return res.status(404).json({ success: false, message: "School not found" });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        logError("Get public school by slug failed", error, { slug: req.params.slug });
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getPublicSchoolDetailContentBySlug = async (req, res) => {
    try {
        const slug = String(req.params.slug || "").trim();
        if (!slug) {
            return res.status(400).json({ success: false, message: "Invalid school slug" });
        }

        const schoolResult = await db.query(
            `SELECT id
             FROM schools
             WHERE slug = $1 AND status = ANY($2::text[])
             LIMIT 1`,
            [slug, PUBLIC_VISIBLE_STATUSES]
        );

        if (!schoolResult.rows.length) {
            return res.status(404).json({ success: false, message: "School not found" });
        }

        const schoolId = schoolResult.rows[0].id;
        const detailContent = await fetchSchoolDetailContentById(schoolId);

        res.json({ success: true, data: detailContent });
    } catch (error) {
        logError("Get public school detail content by slug failed", error, { slug: req.params.slug });
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getPublicSchoolReviewsBySlug = async (req, res) => {
    try {
        const slug = String(req.params.slug || "").trim();
        if (!slug) {
            return res.status(400).json({ success: false, message: "Invalid school slug" });
        }

        const schoolResult = await db.query(
            `SELECT id
             FROM schools
             WHERE slug = $1 AND status = ANY($2::text[])
             LIMIT 1`,
            [slug, PUBLIC_VISIBLE_STATUSES]
        );

        if (!schoolResult.rows.length) {
            return res.status(404).json({ success: false, message: "School not found" });
        }

        const schoolId = schoolResult.rows[0].id;

        const reviewsResult = await db.query(
            `SELECT
                id,
                school_id,
                student_name,
                avatar_url,
                nationality,
                course_period,
                rating,
                content,
                created_at
             FROM school_reviews
             WHERE school_id = $1
             ORDER BY created_at DESC, id DESC`,
            [schoolId]
        );

        res.json({
            success: true,
            data: reviewsResult.rows,
            total: reviewsResult.rows.length
        });
    } catch (error) {
        logError("Get public school reviews by slug failed", error, { slug: req.params.slug });
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
