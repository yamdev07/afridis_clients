import pool from '../config/database.js';

const createNotificationForSubscription = async (subscriptionId, type, title, body) => {
  // Crée des notifications pour le commercial lié (si présent)
  const detailsResult = await pool.query(
    `SELECT s.id,
            s.client_id,
            s.service_id,
            s.agent_id,
            c.full_name as client_name,
            sv.label as service_label
     FROM subscriptions s
     JOIN clients c ON s.client_id = c.id
     JOIN services sv ON s.service_id = sv.id
     WHERE s.id = $1`,
    [subscriptionId],
  );

  if (detailsResult.rows.length === 0) {
    return;
  }

  const details = detailsResult.rows[0];

  const meta = {
    subscription_id: details.id,
    client_id: details.client_id,
    service_id: details.service_id,
  };

  // Notification pour le(s) commercial(aux) lié(s) via agent_id
  if (details.agent_id) {
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, body, meta)
       SELECT u.id, $1, $2, $3, $4::jsonb
       FROM users u
       WHERE u.agent_id = $5`,
      [
        type,
        title,
        body || `Client ${details.client_name} – Service ${details.service_label}`,
        JSON.stringify(meta),
        details.agent_id,
      ],
    );
  }

  // Notifications pour tous les admins et super admins
  await pool.query(
    `INSERT INTO notifications (user_id, type, title, body, meta)
     SELECT u.id, $1, $2, $3, $4::jsonb
     FROM users u
     WHERE u.role IN ('admin', 'super_admin')`,
    [
      type,
      title,
      body || `Client ${details.client_name} – Service ${details.service_label}`,
      JSON.stringify(meta),
    ],
  );
};

export const getAllSubscriptions = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      client_id,
      service_id,
      status_id,
      agent_login,
      from_date,
      to_date,
    } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT s.*,
             c.full_name as client_name, c.email as client_email, c.phone as client_phone,
             sv.code as service_code, sv.label as service_label,
             st.code as status_code, st.label as status_label,
             a.login as agent_login
      FROM subscriptions s
      JOIN clients c ON s.client_id = c.id
      JOIN services sv ON s.service_id = sv.id
      JOIN statuses st ON s.status_id = st.id
      LEFT JOIN agents a ON s.agent_id = a.id
    `;
    const params = [];
    const conditions = [];

    if (client_id) {
      conditions.push(`s.client_id = $${params.length + 1}`);
      params.push(client_id);
    }
    if (service_id) {
      conditions.push(`s.service_id = $${params.length + 1}`);
      params.push(service_id);
    }
    if (status_id) {
      conditions.push(`s.status_id = $${params.length + 1}`);
      params.push(status_id);
    }
    if (agent_login) {
      conditions.push(`a.login = $${params.length + 1}`);
      params.push(agent_login);
    }
    if (from_date) {
      conditions.push(`s.subscription_date >= $${params.length + 1}`);
      params.push(from_date);
    }
    if (to_date) {
      conditions.push(`s.subscription_date <= $${params.length + 1}`);
      params.push(to_date);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` ORDER BY s.subscription_date DESC NULLS LAST, s.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Compter le total
    let countQuery = 'SELECT COUNT(*) FROM subscriptions s LEFT JOIN agents a ON s.agent_id = a.id';
    const countParams = [];
    const countConditions = [];

    if (client_id) {
      countConditions.push(`s.client_id = $${countParams.length + 1}`);
      countParams.push(client_id);
    }
    if (service_id) {
      countConditions.push(`s.service_id = $${countParams.length + 1}`);
      countParams.push(service_id);
    }
    if (status_id) {
      countConditions.push(`s.status_id = $${countParams.length + 1}`);
      countParams.push(status_id);
    }
    if (agent_login) {
      countConditions.push(`a.login = $${countParams.length + 1}`);
      countParams.push(agent_login);
    }
    if (from_date) {
      countConditions.push(`s.subscription_date >= $${countParams.length + 1}`);
      countParams.push(from_date);
    }
    if (to_date) {
      countConditions.push(`s.subscription_date <= $${countParams.length + 1}`);
      countParams.push(to_date);
    }

    if (countConditions.length > 0) {
      countQuery += ' WHERE ' + countConditions.join(' AND ');
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSubscriptionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT s.*,
              c.*,
              sv.*,
              st.*,
              a.login as agent_login, a.first_name as agent_first_name, a.last_name as agent_last_name
       FROM subscriptions s
       JOIN clients c ON s.client_id = c.id
       JOIN services sv ON s.service_id = sv.id
       JOIN statuses st ON s.status_id = st.id
       LEFT JOIN agents a ON s.agent_id = a.id
       WHERE s.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Abonnement non trouvé' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const createSubscription = async (req, res, next) => {
  try {
    const {
      client_id,
      service_id,
      status_id,
      agent_id,
      line_number,
      subscription_date,
      planned_installation_date,
      installation_date,
      contract_cost,
      notes,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO subscriptions (
        client_id, service_id, status_id, agent_id,
        line_number, subscription_date, planned_installation_date,
        installation_date, contract_cost, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        client_id,
        service_id,
        status_id,
        agent_id || null,
        line_number || null,
        subscription_date || null,
        planned_installation_date || null,
        installation_date || null,
        contract_cost || null,
        notes || null,
      ]
    );

    const created = result.rows[0];

    // Notifications : nouvelle souscription
    try {
      await createNotificationForSubscription(
        created.id,
        'subscription_created',
        'Nouvelle souscription',
        null,
      );
    } catch (notifyError) {
      // On log mais on ne bloque pas la réponse principale
      // eslint-disable-next-line no-console
      console.error('Erreur lors de la création de notification:', notifyError);
    }

    res.status(201).json(created);
  } catch (error) {
    if (error.code === '23503') {
      return res.status(400).json({ message: 'Référence invalide (client, service ou statut)' });
    }
    next(error);
  }
};

export const updateSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      status_id,
      agent_id,
      line_number,
      subscription_date,
      planned_installation_date,
      installation_date,
      contract_cost,
      notes,
    } = req.body;

    const result = await pool.query(
      `UPDATE subscriptions
       SET status_id = COALESCE($1, status_id),
           agent_id = COALESCE($2, agent_id),
           line_number = COALESCE($3, line_number),
           subscription_date = COALESCE($4, subscription_date),
           planned_installation_date = COALESCE($5, planned_installation_date),
           installation_date = COALESCE($6, installation_date),
           contract_cost = COALESCE($7, contract_cost),
           notes = COALESCE($8, notes),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [
        status_id,
        agent_id,
        line_number,
        subscription_date,
        planned_installation_date,
        installation_date,
        contract_cost,
        notes,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Abonnement non trouvé' });
    }

    const updated = result.rows[0];

    // Notifications : mise à jour de l'abonnement (changement de statut / installation)
    try {
      await createNotificationForSubscription(
        updated.id,
        'subscription_updated',
        'Mise à jour d’un abonnement',
        null,
      );
    } catch (notifyError) {
      // eslint-disable-next-line no-console
      console.error('Erreur lors de la création de notification (update):', notifyError);
    }

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM subscriptions WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Abonnement non trouvé' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const bulkImportSubscriptions = async (req, res, next) => {
  try {
    const { rows } = req.body;

    console.log('NOMBRE DE LIGNES REÇUES:', rows?.length);

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ message: 'Aucune ligne à importer' });
    }

    // Afficher la structure des 5 premières lignes pour comprendre le mapping
    for (let i = 0; i < Math.min(5, rows.length); i++) {
      console.log(`Ligne ${i}:`, JSON.stringify(rows[i], null, 2));
      console.log(`Clés ligne ${i}:`, Object.keys(rows[i]));
    }

    const resultSummary = {
      created: 0,
      skipped: 0,
      errors: [],
    };

    // Commencer à l'index 3 pour ignorer les 3 premières lignes d'en-tête
    for (let index = 3; index < rows.length; index++) {
      const row = rows[index];
      if (!row) continue;

      // Afficher les valeurs brutes pour cette ligne
      console.log(`\n--- LIGNE ${index + 1} (brute) ---`);
      console.log('__EMPTY_1:', row.__EMPTY_1);
      console.log('__EMPTY_2:', row.__EMPTY_2);
      console.log('__EMPTY_3:', row.__EMPTY_3);
      console.log('__EMPTY_4:', row.__EMPTY_4);
      console.log('__EMPTY_5:', row.__EMPTY_5);
      console.log('__EMPTY_6:', row.__EMPTY_6);
      console.log('__EMPTY_7:', row.__EMPTY_7);
      console.log('__EMPTY_8:', row.__EMPTY_8);
      console.log('__EMPTY_9:', row.__EMPTY_9);
      console.log('__EMPTY_10 à __EMPTY_16:', row.__EMPTY_10, row.__EMPTY_11, row.__EMPTY_12, row.__EMPTY_13, row.__EMPTY_14, row.__EMPTY_15, row.__EMPTY_16);
      console.log('__EMPTY_17:', row.__EMPTY_17);

      // Extraction
      const commercialLogin = row.__EMPTY_1 ? String(row.__EMPTY_1).trim() : '';
      let clientName = row.__EMPTY_2 ? String(row.__EMPTY_2).trim() : '';
      const lineNumber = row.__EMPTY_3 ? String(row.__EMPTY_3).trim() : '';
      const subscriptionDateRaw = row.__EMPTY_4;
      const installationDateRaw = row.__EMPTY_5;
      const email = row.__EMPTY_6 ? String(row.__EMPTY_6).trim() : '';
      const clientPhone = row.__EMPTY_7 ? String(row.__EMPTY_7).trim() : '';
      const paymentReference = row.__EMPTY_9 ? String(row.__EMPTY_9).trim() : '';
      const notes = row.__EMPTY_17 ? String(row.__EMPTY_17).trim() : '';

      // Offre (chercher le 1 dans les colonnes __EMPTY_10 à __EMPTY_16)
      let offer = '';
      if (row.__EMPTY_10 === 1 || row.__EMPTY_10 === '1') offer = 'Pro 25Mbps';
      else if (row.__EMPTY_11 === 1 || row.__EMPTY_11 === '1') offer = 'Pro 50Mbps';
      else if (row.__EMPTY_12 === 1 || row.__EMPTY_12 === '1') offer = 'Pro 80Mbps';
      else if (row.__EMPTY_13 === 1 || row.__EMPTY_13 === '1') offer = 'Office 150Mbps';
      else if (row.__EMPTY_14 === 1 || row.__EMPTY_14 === '1') offer = 'Office 200Mbps';
      else if (row.__EMPTY_15 === 1 || row.__EMPTY_15 === '1') offer = 'HOME 20MBPS';
      else if (row.__EMPTY_16 === 1 || row.__EMPTY_16 === '1') offer = 'HOME 50MBPS';
      // Note: __EMPTY_17 est utilisé pour les notes, pas pour une offre

      console.log('Commercial:', commercialLogin);
      console.log('Client:', clientName);
      console.log('Téléphone:', clientPhone);
      console.log('Email:', email);
      console.log('Numéro ligne:', lineNumber);
      console.log('Offre:', offer);
      console.log('Notes:', notes);

      // Déterminer si la ligne est totalement vide (aucune information exploitable)
      const hasAnyValue =
        commercialLogin ||
        clientName ||
        lineNumber ||
        subscriptionDateRaw ||
        installationDateRaw ||
        email ||
        clientPhone ||
        paymentReference ||
        offer ||
        notes;

      if (!hasAnyValue) {
        console.log('❌ Ligne complètement vide, ignorée');
        resultSummary.skipped++;
        continue;
      }

      // Si le nom du client est manquant mais qu'on a d'autres infos,
      // on génère un nom technique pour NE PAS ignorer la ligne.
      if (!clientName) {
        const base =
          lineNumber ||
          clientPhone ||
          commercialLogin ||
          (subscriptionDateRaw ? String(subscriptionDateRaw) : '') ||
          'inconnu';

        const generated = `Client ${String(base).trim()}`;
        console.log('⚠️ Client name manquant, nom généré:', generated);
        clientName = generated;
      }

      // Conversion des dates
      let subscriptionDate = null;
      if (subscriptionDateRaw && typeof subscriptionDateRaw === 'number') {
        const excelEpoch = new Date(1899, 11, 30);
        const jsDate = new Date(excelEpoch.getTime() + subscriptionDateRaw * 24 * 60 * 60 * 1000);
        subscriptionDate = jsDate.toISOString().split('T')[0];
      } else if (subscriptionDateRaw && typeof subscriptionDateRaw === 'string') {
        subscriptionDate = subscriptionDateRaw.split(' ')[0];
      }

      let installationDate = null;
      if (installationDateRaw && typeof installationDateRaw === 'number') {
        const excelEpoch = new Date(1899, 11, 30);
        const jsDate = new Date(excelEpoch.getTime() + installationDateRaw * 24 * 60 * 60 * 1000);
        installationDate = jsDate.toISOString().split('T')[0];
      } else if (installationDateRaw && typeof installationDateRaw === 'string') {
        installationDate = installationDateRaw.split(' ')[0];
      }

      // --- Client ---
      let clientId = null;

      if (clientPhone) {
        const clientRes = await pool.query(
          `SELECT id FROM clients WHERE phone = $1 LIMIT 1`,
          [clientPhone]
        );
        if (clientRes.rows.length > 0) {
          clientId = clientRes.rows[0].id;
          const addressData = {
            commercial_login: commercialLogin,
            offer,
            payment_reference: paymentReference,
            notes,
          };
          await pool.query(
            `UPDATE clients SET address = $1::jsonb WHERE id = $2`,
            [JSON.stringify(addressData), clientId]
          );
          console.log('✅ Client existant mis à jour, ID:', clientId);
        }
      }

      if (!clientId) {
        const addressData = {
          commercial_login: commercialLogin,
          offer,
          payment_reference: paymentReference,
          notes,
        };
        const insertRes = await pool.query(
          `INSERT INTO clients (full_name, phone, email, address)
           VALUES ($1, $2, $3, $4::jsonb)
           RETURNING id`,
          [clientName, clientPhone || null, email || null, JSON.stringify(addressData)]
        );
        clientId = insertRes.rows[0].id;
        console.log('✅ Client créé, ID:', clientId);
      }

      // --- Service ---
      let serviceId = null;
      if (offer) {
        const serviceRes = await pool.query(
          `SELECT id FROM services WHERE label ILIKE $1 LIMIT 1`,
          [`%${offer}%`]
        );
        if (serviceRes.rows.length > 0) {
          serviceId = serviceRes.rows[0].id;
        } else {
          const codeSlug = offer.toLowerCase().replace(/\s+/g, '_');
          const newService = await pool.query(
            `INSERT INTO services (code, label, is_active)
             VALUES ($1, $2, true)
             RETURNING id`,
            [codeSlug, offer]
          );
          serviceId = newService.rows[0].id;
          console.log('✅ Service créé:', serviceId);
        }
      } else {
        const defaultService = await pool.query(
          `SELECT id FROM services WHERE code = 'default' LIMIT 1`
        );
        if (defaultService.rows.length === 0) {
          const newDefault = await pool.query(
            `INSERT INTO services (code, label, is_active)
             VALUES ('default', 'Service standard', true)
             RETURNING id`
          );
          serviceId = newDefault.rows[0].id;
        } else {
          serviceId = defaultService.rows[0].id;
        }
      }

      // --- Statut ---
      let statusId = null;
      const statusRes = await pool.query(
        `SELECT id FROM statuses WHERE code = 'pending' LIMIT 1`
      );
      if (statusRes.rows.length > 0) {
        statusId = statusRes.rows[0].id;
      } else {
        const newStatus = await pool.query(
          `INSERT INTO statuses (code, label) VALUES ('pending', 'En attente') RETURNING id`
        );
        statusId = newStatus.rows[0].id;
      }

      // --- Agent ---
      let agentId = null;
      if (commercialLogin) {
        const agentRes = await pool.query(
          `SELECT id FROM agents WHERE login ILIKE $1 LIMIT 1`,
          [commercialLogin]
        );
        if (agentRes.rows.length > 0) {
          agentId = agentRes.rows[0].id;
        } else {
          const newAgent = await pool.query(
            `INSERT INTO agents (login, first_name, last_name, active)
             VALUES ($1, $2, '', true)
             RETURNING id`,
            [commercialLogin, commercialLogin]
          );
          agentId = newAgent.rows[0].id;
          console.log('✅ Agent créé:', agentId);
        }
      }

      // --- Abonnement ---
      const subRes = await pool.query(
        `INSERT INTO subscriptions (
          client_id, service_id, status_id, agent_id,
          line_number, subscription_date, planned_installation_date, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id`,
        [
          clientId,
          serviceId,
          statusId,
          agentId,
          lineNumber || null,
          subscriptionDate,
          installationDate,
          notes || null,
        ]
      );

      console.log('✅ Abonnement créé, ID:', subRes.rows[0].id);
      resultSummary.created++;
    }

    console.log('\n--- RÉSUMÉ FINAL ---');
    console.log('Créés:', resultSummary.created);
    console.log('Ignorés:', resultSummary.skipped);
    console.log('Erreurs:', resultSummary.errors.length);

    res.status(201).json(resultSummary);
  } catch (error) {
    console.error('💥 ERREUR GLOBALE:', error);
    next(error);
  }
};