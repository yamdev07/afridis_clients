import pool from '../config/database.js';
import { sendNotificationEmail } from '../services/mailer.js';

export const listNotifications = async (req, res, next) => {
  try {
    const { unreadOnly } = req.query;

    let query = `
      SELECT id,
             type,
             title,
             message,
             body,
             meta,
             is_read,
             created_at
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
      return res.status(404).json({ message: 'Notification non trouvee' });
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Notification non trouvee' });
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

export const createNotification = async ({ userId, type, title, message, meta }) => {
  try {
    if (!message) {
      throw new Error('Notification message is required');
    }

    const insertResult = await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, body, meta)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, user_id, type, title, message, body, meta, is_read, created_at`,
      [userId, type, title, message, message, meta ? JSON.stringify(meta) : null],
    );

    try {
      const userResult = await pool.query('SELECT name, email FROM users WHERE id = $1', [userId]);
      const user = userResult.rows[0];
      if (user?.email) {
        await sendNotificationEmail({
          to: user.email,
          userName: user.name,
          notification: insertResult.rows[0],
        });
      }
    } catch (e) {
      console.warn('[MAIL] Failed to send notification email:', e?.message || e);
    }

    return true;
  } catch (error) {
    console.error('Error creating notification:', error);
    return false;
  }
};

export const notifyAdmins = async ({ type, title, message, meta }) => {
  try {
    console.log('NOTIFY ADMINS:', { type, title, message });

    const admins = await pool.query("SELECT id FROM users WHERE role IN ('super_admin', 'admin_local', 'admin')");
    for (const admin of admins.rows) {
      await createNotification({ userId: admin.id, type, title, message, meta });
    }
  } catch (error) {
    console.error('Error notifying admins:', error);
  }
};
