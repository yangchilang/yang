import { query } from '../utils/database';
import { Reading, SelectedCard } from '../types';

export async function createReading(
  userId: number,
  cards: SelectedCard[],
  interpretation: string,
  userContext: string,
  orderId: string,
  title?: string,
  customerGender?: string,
  relatedOrderId?: string,
  customerInfo?: string,
  customerStatement?: string,
  customerQuestion?: string
): Promise<Reading> {
  const cardsJson = JSON.stringify(cards);

  const result = await query(
    'INSERT INTO readings (user_id, cards, interpretation, user_context, order_id, title, customer_gender, related_order_id, customer_info, customer_statement, customer_question) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
    [userId, cardsJson, interpretation, userContext, orderId, title || null, customerGender || null, relatedOrderId || null, customerInfo || null, customerStatement || null, customerQuestion || null]
  );

  const row = result.rows[0];
  return {
    id: row.id,
    user_id: row.user_id,
    cards: row.cards,
    interpretation: row.interpretation,
    user_context: row.user_context,
    order_id: row.order_id,
    title: row.title,
    customer_gender: row.customer_gender,
    related_order_id: row.related_order_id,
    customer_info: row.customer_info,
    customer_statement: row.customer_statement,
    customer_question: row.customer_question,
    created_at: row.created_at.toISOString(),
  };
}

export async function getReadingsByUserId(
  userId: number,
  page: number = 1,
  limit: number = 10
): Promise<{ readings: Reading[]; total: number }> {
  const offset = (page - 1) * limit;

  const totalResult = await query(
    'SELECT COUNT(*) as count FROM readings WHERE user_id = $1',
    [userId]
  );
  const total = parseInt(totalResult.rows[0].count, 10);

  const readingsResult = await query(
    'SELECT * FROM readings WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
    [userId, limit, offset]
  );

  const readings: Reading[] = readingsResult.rows.map((row) => ({
    id: row.id,
    user_id: row.user_id,
    cards: row.cards,
    interpretation: row.interpretation,
    user_context: row.user_context,
    order_id: row.order_id,
    title: row.title,
    customer_gender: row.customer_gender,
    related_order_id: row.related_order_id,
    customer_info: row.customer_info,
    customer_statement: row.customer_statement,
    customer_question: row.customer_question,
    created_at: row.created_at.toISOString(),
  }));

  return { readings, total };
}

export async function getReadingById(
  readingId: number,
  userId: number
): Promise<Reading | null> {
  const result = await query(
    'SELECT * FROM readings WHERE id = $1 AND user_id = $2',
    [readingId, userId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: row.id,
    user_id: row.user_id,
    cards: row.cards,
    interpretation: row.interpretation,
    user_context: row.user_context,
    order_id: row.order_id,
    title: row.title,
    customer_gender: row.customer_gender,
    related_order_id: row.related_order_id,
    customer_info: row.customer_info,
    customer_statement: row.customer_statement,
    customer_question: row.customer_question,
    created_at: row.created_at.toISOString(),
  };
}

export async function getReadingByOrderId(
  orderId: string,
  userId: number
): Promise<Reading | null> {
  const result = await query(
    'SELECT * FROM readings WHERE order_id = $1 AND user_id = $2',
    [orderId, userId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: row.id,
    user_id: row.user_id,
    cards: row.cards,
    interpretation: row.interpretation,
    user_context: row.user_context,
    order_id: row.order_id,
    title: row.title,
    customer_gender: row.customer_gender,
    related_order_id: row.related_order_id,
    customer_info: row.customer_info,
    customer_statement: row.customer_statement,
    customer_question: row.customer_question,
    created_at: row.created_at.toISOString(),
  };
}

export async function searchReadings(
  keyword: string,
  userId: number
): Promise<Reading[]> {
  const pattern = `%${keyword}%`;

  const result = await query(
    'SELECT * FROM readings WHERE user_id = $1 AND (order_id LIKE $2 OR related_order_id LIKE $3 OR title LIKE $4) ORDER BY created_at DESC',
    [userId, pattern, pattern, pattern]
  );

  return result.rows.map((row) => ({
    id: row.id,
    user_id: row.user_id,
    cards: row.cards,
    interpretation: row.interpretation,
    user_context: row.user_context,
    order_id: row.order_id,
    title: row.title,
    customer_gender: row.customer_gender,
    related_order_id: row.related_order_id,
    customer_info: row.customer_info,
    customer_statement: row.customer_statement,
    customer_question: row.customer_question,
    created_at: row.created_at.toISOString(),
  }));
}

export async function getRelatedReadings(
  orderId: string,
  relatedOrderId: string | undefined,
  userId: number
): Promise<Reading[]> {
  let conditions = 'user_id = $1 AND (order_id = $2';
  const params: any[] = [userId, orderId];

  if (relatedOrderId) {
    conditions += ' OR related_order_id = $3)';
    params.push(relatedOrderId);
  } else {
    conditions += ')';
  }

  const result = await query(
    `SELECT * FROM readings WHERE ${conditions} ORDER BY created_at DESC`,
    params
  );

  return result.rows.map((row) => ({
    id: row.id,
    user_id: row.user_id,
    cards: row.cards,
    interpretation: row.interpretation,
    user_context: row.user_context,
    order_id: row.order_id,
    title: row.title,
    customer_gender: row.customer_gender,
    related_order_id: row.related_order_id,
    customer_info: row.customer_info,
    customer_statement: row.customer_statement,
    customer_question: row.customer_question,
    created_at: row.created_at.toISOString(),
  }));
}

export async function deleteReading(readingId: number, userId: number): Promise<boolean> {
  const existing = await query(
    'SELECT id FROM readings WHERE id = $1 AND user_id = $2',
    [readingId, userId]
  );

  if (existing.rows.length === 0) {
    return false;
  }

  await query('DELETE FROM readings WHERE id = $1 AND user_id = $2', [readingId, userId]);
  return true;
}