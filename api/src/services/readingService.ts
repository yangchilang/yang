import { getDatabase, saveDatabase } from '../utils/database';
import { Reading, SelectedCard } from '../types';

export function createReading(
  userId: number,
  cards: SelectedCard[],
  interpretation: string,
  userContext: string,
  orderId: string,
  customerGender?: string,
  relatedOrderId?: string,
  customerInfo?: string,
  customerStatement?: string,
  customerQuestion?: string
): Reading {
  const db = getDatabase();
  const cardsJson = JSON.stringify(cards);

  db.run(
    'INSERT INTO readings (user_id, cards, interpretation, user_context, order_id, customer_gender, related_order_id, customer_info, customer_statement, customer_question) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [userId, cardsJson, interpretation, userContext, orderId, customerGender || null, relatedOrderId || null, customerInfo || null, customerStatement || null, customerQuestion || null]
  );

  saveDatabase();

  const result = db.exec('SELECT last_insert_rowid() as id');
  const readingId = result[0].values[0][0] as number;

  const readingResult = db.exec('SELECT * FROM readings WHERE id = ?', [readingId]);
  const readingRow = readingResult[0].values[0];

  return {
    id: readingRow[0] as number,
    user_id: readingRow[1] as number,
    cards: readingRow[2] as string,
    interpretation: readingRow[3] as string,
    user_context: readingRow[4] as string,
    order_id: readingRow[5] as string,
    customer_gender: readingRow[6] as string | undefined,
    related_order_id: readingRow[7] as string | undefined,
    customer_info: readingRow[8] as string | undefined,
    customer_statement: readingRow[9] as string | undefined,
    customer_question: readingRow[10] as string | undefined,
    created_at: readingRow[11] as string,
  };
}

export function getReadingsByUserId(
  userId: number,
  page: number = 1,
  limit: number = 10
): { readings: Reading[]; total: number } {
  const db = getDatabase();
  const offset = (page - 1) * limit;

  const totalResult = db.exec(
    'SELECT COUNT(*) as count FROM readings WHERE user_id = ?',
    [userId]
  );
  const total = totalResult[0].values[0][0] as number;

  const readingsResult = db.exec(
    'SELECT * FROM readings WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [userId, limit, offset]
  );

  const readings: Reading[] = readingsResult[0].values.map((row) => ({
    id: row[0] as number,
    user_id: row[1] as number,
    cards: row[2] as string,
    interpretation: row[3] as string,
    user_context: row[4] as string,
    order_id: row[5] as string,
    customer_gender: row[6] as string | undefined,
    related_order_id: row[7] as string | undefined,
    customer_info: row[8] as string | undefined,
    customer_statement: row[9] as string | undefined,
    customer_question: row[10] as string | undefined,
    created_at: row[11] as string,
  }));

  return { readings, total };
}

export function getReadingById(
  readingId: number,
  userId: number
): Reading | null {
  const db = getDatabase();

  const result = db.exec(
    'SELECT * FROM readings WHERE id = ? AND user_id = ?',
    [readingId, userId]
  );

  if (result.length === 0 || result[0].values.length === 0) {
    return null;
  }

  const row = result[0].values[0];
  return {
    id: row[0] as number,
    user_id: row[1] as number,
    cards: row[2] as string,
    interpretation: row[3] as string,
    user_context: row[4] as string,
    order_id: row[5] as string,
    customer_gender: row[6] as string | undefined,
    related_order_id: row[7] as string | undefined,
    customer_info: row[8] as string | undefined,
    customer_statement: row[9] as string | undefined,
    customer_question: row[10] as string | undefined,
    created_at: row[11] as string,
  };
}

export function getReadingByOrderId(
  orderId: string,
  userId: number
): Reading | null {
  const db = getDatabase();

  const result = db.exec(
    'SELECT * FROM readings WHERE order_id = ? AND user_id = ?',
    [orderId, userId]
  );

  if (result.length === 0 || result[0].values.length === 0) {
    return null;
  }

  const row = result[0].values[0];
  return {
    id: row[0] as number,
    user_id: row[1] as number,
    cards: row[2] as string,
    interpretation: row[3] as string,
    user_context: row[4] as string,
    order_id: row[5] as string,
    customer_gender: row[6] as string | undefined,
    related_order_id: row[7] as string | undefined,
    customer_info: row[8] as string | undefined,
    customer_statement: row[9] as string | undefined,
    customer_question: row[10] as string | undefined,
    created_at: row[11] as string,
  };
}

export function deleteReading(readingId: number, userId: number): boolean {
  const db = getDatabase();

  const existing = db.exec(
    'SELECT id FROM readings WHERE id = ? AND user_id = ?',
    [readingId, userId]
  );

  if (existing.length === 0 || existing[0].values.length === 0) {
    return false;
  }

  db.run('DELETE FROM readings WHERE id = ? AND user_id = ?', [readingId, userId]);
  saveDatabase();

  return true;
}
