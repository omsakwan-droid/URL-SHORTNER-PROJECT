import { db } from '../db/index.js';
import { urlsTable } from '../models/url.model.js';

export async function createShortURL({
    shortCode,
    targetURL,
    userID,
}) {
    const [result] = await db
        .insert(urlsTable)
        .values({
            shortCode,
            targetURL,
            userID,
        })
        .returning({
            id: urlsTable.id,
            shortCode: urlsTable.shortCode,
            targetURL: urlsTable.targetURL,
        });

    return result;
}