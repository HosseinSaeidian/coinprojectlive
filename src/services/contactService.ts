import { ContactFormData, ApiResponse } from '../types';

/**
 * Service for sending user inquiries.
 * Structured for future FastAPI endpoint:
 * - POST /api/contact
 */
export const contactService = {
  /**
   * Submits contact message to backend
   * FastAPI Target: POST /api/contact
   */
  async submitContactForm(data: ContactFormData): Promise<ApiResponse<{ referenceId: string }>> {
    // Simulating FastAPI validation and persistence latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (!data.fullName.trim() || !data.phoneNumber.trim() || !data.message.trim()) {
      throw new Error('لطفاً تمامی فیلدهای ستاره‌دار را تکمیل نمایید.');
    }

    // Generate simulated Persian reference code
    const randomRef = Math.floor(100000 + Math.random() * 900000).toString();

    return {
      success: true,
      data: {
        referenceId: `FC-${randomRef}`,
      },
      message: 'پیام شما با موفقیت ثبت شد. کارشناسان فرشته کوین به زودی با شما تماس خواهند گرفت.',
      timestamp: new Date().toISOString(),
    };
  },
};
