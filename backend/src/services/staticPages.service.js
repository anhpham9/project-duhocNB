import db from "../config/db.js";

export const getStaticPageDataBySlug = async (slug) => {
    const result = await db.query(
        `SELECT
            sp.id,
            sp.title,
            sp.slug,
            sp.hero_title,
            sp.hero_description,
            sp.meta_title,
            sp.meta_description,
            sp.type,
            sp.status,
            sp.updated_by,
            sp.created_at,
            sp.updated_at,
            COALESCE(pc.content, '') AS content,
            pc.updated_at AS content_updated_at
         FROM static_pages sp
         LEFT JOIN page_contents pc ON pc.page_id = sp.id
         WHERE sp.slug = $1
         LIMIT 1`,
        [slug]
    );

    return result.rows[0] || null;
};