/**
 * Trolley Contents Service - Get required contents for trolleys
 * Handles endpoint: GET /api/trolleys/{id}/required-contents/
 */

import { apiClient, ApiClientResponse } from '@/lib/api-client';
import { TrolleyRequiredContents } from '@/types/api';

export class TrolleyContentsService {
  /**
   * Get required contents for a specific trolley
   * Includes specifications, products by level, and products by drawer
   * Example: GET /api/trolleys/1/required-contents/
   */
  static async getTrolleyContents(
    trolleyId: number,
  ): Promise<ApiClientResponse<TrolleyRequiredContents>> {
    return apiClient.get<TrolleyRequiredContents>(
      `/api/trolleys/${trolleyId}/required-contents/`,
    );
  }
}
