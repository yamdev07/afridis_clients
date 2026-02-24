import pool from '../config/database.js';

export const listNotifications = async (req, res, next) => {
  try {
    const { unreadOnly } = req.query;

    let query = `
      SELECT id, type, title, body, is_read, meta, created_at
      FROM notifications
      WHERE user_id = $1
    `;
    const params = [req.user.id];

    if (unreadOnly === 'true') {
      query += ' AND is_read = false';
    }

    query += ' ORDER BY created_at DESC LIMIT 100';

    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE notifications
       SET is_read = true
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Notification non trouvée' });
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsRead = async (req, res, next) => {
  try {
    await pool.query(
      `UPDATE notifications
       SET is_read = true
       WHERE user_id = $1 AND is_read = false`,
      [req.user.id],
    );

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

