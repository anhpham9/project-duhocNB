import db from "../config/db.js";
import { logError } from "../utils/logger.js";

const CONTACT_ROLES = [1, 2, 3, 5];
const SCHOOL_ROLES = [1, 2, 3];
const NEWS_ROLES = [1, 2, 3, 4];

const PERIOD_DAY_MAP = {
    week: 7,
    month: 30,
    quarter: 90
};

const ROLE_NAME_MAP = {
    1: "Superadmin",
    2: "Admin",
    3: "Manager",
    4: "Editor",
    5: "Consultant"
};

const ROLE_WIDGETS_MAP = {
    1: [
        "kpi.contactsToday",
        "kpi.contactsPending",
        "kpi.schoolsTotal",
        "kpi.newsThisWeek",
        "alerts.system",
        "list.todoToday",
        "chart.contactsByDay",
        "list.recentContacts",
        "list.topSchools"
    ],
    2: [
        "kpi.contactsToday",
        "kpi.contactsPending",
        "kpi.schoolsTotal",
        "kpi.newsThisWeek",
        "alerts.system",
        "list.todoToday",
        "chart.contactsByDay",
        "list.recentContacts",
        "list.topSchools"
    ],
    3: [
        "kpi.contactsToday",
        "kpi.contactsPending",
        "kpi.schoolsTotal",
        "kpi.newsThisWeek",
        "list.todoToday",
        "chart.contactsByDay",
        "list.recentContacts",
        "list.topSchools"
    ],
    4: [
        "kpi.newsThisWeek",
        "kpi.newsTotal",
        "list.todoToday",
        "list.recentNews"
    ],
    5: [
        "kpi.contactsToday",
        "kpi.contactsPending",
        "list.todoToday",
        "chart.contactsByDay",
        "list.recentContacts"
    ]
};

const toInt = (value, fallback = 0) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizePeriod = (period) => {
    if (!period || typeof period !== "string") return "week";
    return PERIOD_DAY_MAP[period] ? period : "week";
};

const safePercent = (numerator, denominator) => {
    if (!denominator || denominator <= 0) return 0;
    return Math.round((numerator / denominator) * 1000) / 10;
};

const buildKpi = ({ key, label, value, delta = 0, compareTo = "previous_period", status = "neutral", unit = "count" }) => ({
    key,
    label,
    value,
    unit,
    trend: {
        delta,
        deltaPercent: value ? safePercent(delta, value - delta) : 0,
        direction: delta > 0 ? "up" : delta < 0 ? "down" : "flat",
        compareTo
    },
    status
});

const getStatusCount = (rows = [], status) => {
    const found = rows.find((item) => item.status === status);
    return toInt(found?.count);
};

const loadContactOverview = async () => {
    const [todayResult, totalResult, statusResult, recentResult] = await Promise.all([
        db.query(
            `SELECT COUNT(*)::int AS total
             FROM contacts
             WHERE DATE(created_at) = CURRENT_DATE`
        ),
        db.query("SELECT COUNT(*)::int AS total FROM contacts"),
        db.query(
            `SELECT status, COUNT(*)::int AS count
             FROM contacts
             GROUP BY status
             ORDER BY
                CASE status
                    WHEN 'new' THEN 1
                    WHEN 'pending' THEN 2
                    WHEN 'responded' THEN 3
                    WHEN 'closed' THEN 4
                    ELSE 99
                END`
        ),
        db.query(
            `SELECT id, name, email, phone, message, status, created_at
             FROM contacts
             ORDER BY created_at DESC
             LIMIT 5`
        )
    ]);

    return {
        totalToday: toInt(todayResult.rows[0]?.total),
        total: toInt(totalResult.rows[0]?.total),
        byStatus: statusResult.rows,
        recent: recentResult.rows
    };
};

const loadContactTrend = async (days) => {
    const result = await db.query(
        `SELECT
            day::date,
            TO_CHAR(day::date, 'DD/MM') AS label,
            COUNT(c.id)::int AS count
         FROM generate_series(
            CURRENT_DATE - ($1::int - 1),
            CURRENT_DATE,
            INTERVAL '1 day'
         ) AS day
         LEFT JOIN contacts c
            ON DATE(c.created_at) = day::date
         GROUP BY day
         ORDER BY day ASC`,
        [days]
    );

    return result.rows.map((row) => ({
        date: row.day,
        label: row.label,
        count: toInt(row.count)
    }));
};

const loadContactOverdueStats = async () => {
    const [overdue24hResult, overdue48hResult] = await Promise.all([
        db.query(
            `SELECT COUNT(*)::int AS total
             FROM contacts
             WHERE status IN ('new', 'pending')
               AND created_at <= NOW() - INTERVAL '24 hours'`
        ),
        db.query(
            `SELECT COUNT(*)::int AS total
             FROM contacts
             WHERE status IN ('new', 'pending')
               AND created_at <= NOW() - INTERVAL '48 hours'`
        )
    ]);

    return {
        overdue24h: toInt(overdue24hResult.rows[0]?.total),
        overdue48h: toInt(overdue48hResult.rows[0]?.total)
    };
};

const loadSchoolOverview = async () => {
    const [totalResult, statusResult, topResult] = await Promise.all([
        db.query("SELECT COUNT(*)::int AS total FROM schools"),
        db.query(
            `SELECT status, COUNT(*)::int AS count
             FROM schools
             GROUP BY status
             ORDER BY
                CASE status
                    WHEN 'partner' THEN 1
                    WHEN 'active' THEN 2
                    WHEN 'paused' THEN 3
                    WHEN 'pending' THEN 4
                    ELSE 99
                END`
        ),
        db.query(
            `SELECT id, name, location, status, type_id, rating, review_count
             FROM schools
             ORDER BY COALESCE(rating, 0) DESC, COALESCE(review_count, 0) DESC, created_at DESC
             LIMIT 5`
        )
    ]);

    return {
        total: toInt(totalResult.rows[0]?.total),
        byStatus: statusResult.rows,
        top: topResult.rows
    };
};

const loadNewsOverview = async () => {
    const [totalResult, weeklyResult, statusResult, recentResult] = await Promise.all([
        db.query("SELECT COUNT(*)::int AS total FROM news"),
        db.query(
            `SELECT COUNT(*)::int AS total
             FROM news
             WHERE created_at >= date_trunc('week', CURRENT_DATE)`
        ),
        db.query(
            `SELECT status, COUNT(*)::int AS count
             FROM news
             GROUP BY status
             ORDER BY
                CASE status
                    WHEN 'draft' THEN 1
                    WHEN 'published' THEN 2
                    WHEN 'archived' THEN 3
                    ELSE 99
                END`
        ),
        db.query(
            `SELECT id, title, status, created_at
             FROM news
             ORDER BY created_at DESC
             LIMIT 5`
        )
    ]);

    return {
        total: toInt(totalResult.rows[0]?.total),
        thisWeek: toInt(weeklyResult.rows[0]?.total),
        byStatus: statusResult.rows,
        recent: recentResult.rows
    };
};

const loadBackupLatest = async () => {
    const result = await db.query(
        `SELECT id, file_name, status, backup_type, created_at
         FROM backup_records
         ORDER BY created_at DESC
         LIMIT 1`
    );

    return result.rows[0] || null;
};

const loadLockedUsersCount = async () => {
    const result = await db.query(
        `SELECT COUNT(*)::int AS total
         FROM users
         WHERE locked_until IS NOT NULL
           AND locked_until > NOW()`
    );

    return toInt(result.rows[0]?.total);
};

const loadUnreadNotifications = async (userId) => {
    const result = await db.query(
        `SELECT COUNT(*)::int AS total
         FROM notifications
         WHERE user_id = $1 AND is_read = FALSE`,
        [userId]
    );

    return toInt(result.rows[0]?.total);
};

const safeLoad = async (loader, fallback) => {
    try {
        return await loader();
    } catch {
        return fallback;
    }
};

export const getDashboardOverview = async (req, res) => {
    try {
        const roleId = req.user?.role_id;
        const userId = req.user?.id;
        const period = normalizePeriod(req.query?.period);
        const days = PERIOD_DAY_MAP[period];

        const canViewContacts = CONTACT_ROLES.includes(roleId);
        const canViewSchools = SCHOOL_ROLES.includes(roleId);
        const canViewNews = NEWS_ROLES.includes(roleId);
        const canViewSystem = [1, 2].includes(roleId);

        const previousPeriodStart = `CURRENT_DATE - INTERVAL '${days * 2 - 1} days'`;
        const previousPeriodEnd = `CURRENT_DATE - INTERVAL '${days} days'`;

        const [contactOverview, contactTrend, schoolOverview, newsOverview, overdueStats, backupLatest, lockedUsersCount, unreadNotifications, previousContactsResult, previousNewsResult] = await Promise.all([
            canViewContacts ? loadContactOverview() : Promise.resolve(null),
            canViewContacts ? loadContactTrend(days) : Promise.resolve([]),
            canViewSchools ? loadSchoolOverview() : Promise.resolve(null),
            canViewNews ? loadNewsOverview() : Promise.resolve(null),
            canViewContacts ? loadContactOverdueStats() : Promise.resolve({ overdue24h: 0, overdue48h: 0 }),
            canViewSystem ? safeLoad(loadBackupLatest, null) : Promise.resolve(null),
            canViewSystem ? safeLoad(loadLockedUsersCount, 0) : Promise.resolve(0),
            safeLoad(() => loadUnreadNotifications(userId), 0),
            canViewContacts
                ? db.query(
                    `SELECT COUNT(*)::int AS total
                     FROM contacts
                     WHERE created_at >= ${previousPeriodStart}
                       AND created_at < ${previousPeriodEnd}`
                )
                : Promise.resolve({ rows: [{ total: 0 }] }),
            canViewNews
                ? db.query(
                    `SELECT COUNT(*)::int AS total
                     FROM news
                     WHERE created_at >= ${previousPeriodStart}
                       AND created_at < ${previousPeriodEnd}`
                )
                : Promise.resolve({ rows: [{ total: 0 }] })
        ]);

        const pendingContacts = canViewContacts
            ? contactOverview.byStatus
                .filter((item) => ["new", "pending"].includes(item.status))
                .reduce((sum, item) => sum + toInt(item.count), 0)
            : 0;

        const previousContacts = toInt(previousContactsResult.rows[0]?.total);
        const previousNews = toInt(previousNewsResult.rows[0]?.total);
        const contactsToday = canViewContacts ? contactOverview.totalToday : 0;
        const newsThisWeek = canViewNews ? newsOverview.thisWeek : 0;

        const kpis = [];
        if (canViewContacts) {
            kpis.push(buildKpi({
                key: "contactsToday",
                label: "Liên hệ hôm nay",
                value: contactsToday,
                delta: contactsToday - Math.round(previousContacts / Math.max(days, 1)),
                compareTo: "average_previous_period",
                status: overdueStats.overdue24h > 0 ? "warning" : "good"
            }));
            kpis.push(buildKpi({
                key: "contactsPending",
                label: "Liên hệ chờ xử lý",
                value: pendingContacts,
                delta: -overdueStats.overdue24h,
                compareTo: "sla_24h",
                status: overdueStats.overdue24h > 0 ? "warning" : "good"
            }));
        }

        if (canViewSchools) {
            kpis.push(buildKpi({
                key: "schoolsTotal",
                label: "Tổng trường học",
                value: schoolOverview.total,
                delta: getStatusCount(schoolOverview.byStatus, "active"),
                compareTo: "active_status",
                status: "good"
            }));
        }

        if (canViewNews) {
            kpis.push(buildKpi({
                key: "newsThisWeek",
                label: "Tin mới tuần này",
                value: newsThisWeek,
                delta: newsThisWeek - previousNews,
                compareTo: "previous_period",
                status: newsThisWeek > 0 ? "good" : "neutral"
            }));

            kpis.push(buildKpi({
                key: "newsTotal",
                label: "Tổng bài viết",
                value: newsOverview.total,
                delta: getStatusCount(newsOverview.byStatus, "published"),
                compareTo: "published_status",
                status: "good"
            }));
        }

        if (canViewSystem) {
            kpis.push(buildKpi({
                key: "unreadNotifications",
                label: "Thông báo chưa đọc",
                value: unreadNotifications,
                delta: 0,
                compareTo: "current",
                status: unreadNotifications > 0 ? "warning" : "good"
            }));
        }

        const alerts = [];
        if (canViewContacts && overdueStats.overdue24h > 0) {
            alerts.push({
                id: "alert_contacts_overdue_24h",
                severity: overdueStats.overdue48h > 0 ? "critical" : "warning",
                code: "contacts_overdue_sla",
                title: `Có ${overdueStats.overdue24h} liên hệ quá SLA 24h`,
                description: overdueStats.overdue48h > 0
                    ? `${overdueStats.overdue48h} liên hệ đã quá 48h chưa xử lý`
                    : "Cần phản hồi sớm để tránh tụt KPI",
                actionUrl: "/admin/contacts",
                createdAt: new Date().toISOString()
            });
        }

        if (canViewSystem && backupLatest && backupLatest.status !== "success") {
            alerts.push({
                id: "alert_backup_failed",
                severity: "critical",
                code: "backup_failed",
                title: "Backup gần nhất không thành công",
                description: `${backupLatest.file_name || "Bản backup"} có trạng thái ${backupLatest.status}`,
                actionUrl: "/admin/settings/backup",
                createdAt: backupLatest.created_at || new Date().toISOString()
            });
        }

        if (canViewSystem && lockedUsersCount > 0) {
            alerts.push({
                id: "alert_locked_users",
                severity: "warning",
                code: "users_locked",
                title: `Có ${lockedUsersCount} tài khoản đang bị khóa`,
                description: "Kiểm tra lịch sử đăng nhập thất bại để xử lý kịp thời",
                actionUrl: "/admin/users",
                createdAt: new Date().toISOString()
            });
        }

        const todoToday = [];
        if (canViewContacts && pendingContacts > 0) {
            todoToday.push({
                id: "todo_contacts_pending",
                type: "contact_followup",
                priority: overdueStats.overdue24h > 0 ? "high" : "medium",
                title: `Xử lý ${pendingContacts} liên hệ mới/chờ phản hồi`,
                actionUrl: "/admin/contacts",
                dueAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
            });
        }

        if (canViewNews) {
            const draftCount = getStatusCount(newsOverview.byStatus, "draft");
            if (draftCount > 0) {
                todoToday.push({
                    id: "todo_news_draft",
                    type: "news_review",
                    priority: draftCount > 5 ? "high" : "medium",
                    title: `Rà soát ${draftCount} bài viết đang ở trạng thái nháp`,
                    actionUrl: "/admin/news",
                    dueAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()
                });
            }
        }

        if (canViewSchools) {
            const pendingSchools = getStatusCount(schoolOverview.byStatus, "pending");
            if (pendingSchools > 0) {
                todoToday.push({
                    id: "todo_schools_pending",
                    type: "school_review",
                    priority: "medium",
                    title: `Có ${pendingSchools} trường đang chờ duyệt`,
                    actionUrl: "/admin/schools",
                    dueAt: new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString()
                });
            }
        }

        const contactResponded = canViewContacts ? getStatusCount(contactOverview.byStatus, "responded") + getStatusCount(contactOverview.byStatus, "closed") : 0;
        const contactTotal = canViewContacts ? contactOverview.total : 0;
        const sla = {
            responseWithin24hRate: canViewContacts ? safePercent(Math.max(contactTotal - overdueStats.overdue24h, 0), Math.max(contactTotal, 1)) : null,
            overdue24hCount: canViewContacts ? overdueStats.overdue24h : null,
            overdue48hCount: canViewContacts ? overdueStats.overdue48h : null,
            closedRate: canViewContacts ? safePercent(getStatusCount(contactOverview.byStatus, "closed"), Math.max(contactTotal, 1)) : null,
            processedRate: canViewContacts ? safePercent(contactResponded, Math.max(contactTotal, 1)) : null
        };

        const visibleWidgets = ROLE_WIDGETS_MAP[roleId] || ROLE_WIDGETS_MAP[2];

        res.json({
            success: true,
            data: {
                generatedAt: new Date().toISOString(),
                period,
                role: {
                    id: roleId,
                    name: ROLE_NAME_MAP[roleId] || `Role ${roleId || "unknown"}`
                },
                permissions: {
                    contacts: canViewContacts,
                    schools: canViewSchools,
                    news: canViewNews,
                    system: canViewSystem
                },
                visibleWidgets,
                kpis,
                alerts,
                sla,
                overview: {
                    contactsToday: canViewContacts ? contactOverview.totalToday : null,
                    contactsTotal: canViewContacts ? contactOverview.total : null,
                    contactsPending: canViewContacts ? pendingContacts : null,
                    schoolsTotal: canViewSchools ? schoolOverview.total : null,
                    newsTotal: canViewNews ? newsOverview.total : null,
                    newsThisWeek: canViewNews ? newsOverview.thisWeek : null
                },
                charts: {
                    contactsByDay: contactTrend
                },
                lists: {
                    todoToday,
                    recentContacts: canViewContacts ? contactOverview.recent : [],
                    topSchools: canViewSchools ? schoolOverview.top : [],
                    recentNews: canViewNews ? newsOverview.recent : []
                },
                breakdowns: {
                    contactsByStatus: canViewContacts ? contactOverview.byStatus : [],
                    schoolsByStatus: canViewSchools ? schoolOverview.byStatus : [],
                    newsByStatus: canViewNews ? newsOverview.byStatus : []
                }
            }
        });
    } catch (error) {
        logError("Get dashboard overview failed", error, {
            requesterId: req.user?.id,
            roleId: req.user?.role_id,
            period: req.query?.period
        });

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};