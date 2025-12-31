import { apiGet, apiPost } from "../utils";
import {
  FieldInfo,
  AllFieldsResponse,
  AvailableFieldsResponse,
  CreateFieldRequest,
  CreateFieldResponse,
  ShutdownFieldRequest,
  CheckFlagRequest,
  CheckFlagResponse,
  RunningFieldResponse,
  FieldFunctionIntroResponse,
} from "../types";

/**
 * Get all fields/challenges information
 */
export const getAllFields = async (): Promise<FieldInfo[]> => {
  const response = await apiGet<AllFieldsResponse>("/get_all_fields_info");
  return response.data.all_fields_info;
};

/**
 * Get available fields for current user
 */
export const getAvailableFieldsForUser = async (): Promise<string[]> => {
  const response = await apiGet<AvailableFieldsResponse>("/get_available_fields_for_user");
  return response.data.available_fields_list;
};

/**
 * Create a new field instance
 */
export const createField = async (fieldName: string): Promise<CreateFieldResponse> => {
  const request: CreateFieldRequest = { field_name: fieldName };
  const response = await apiPost<CreateFieldResponse>("/create_field", request);
  return response.data;
};

/**
 * Shutdown a field instance
 */
export const shutdownField = async (fieldId: string): Promise<void> => {
  const request: ShutdownFieldRequest = { field_id: fieldId };
  await apiPost<void>("/shutdown_field", request);
};

/**
 * Check/Submit flag for a field
 */
export const checkFlag = async (
  fieldId: string,
  flag: string
): Promise<CheckFlagResponse> => {
  const request: CheckFlagRequest = { field_id: fieldId, flag };
  const response = await apiPost<CheckFlagResponse>("/check_flag", request);
  return {
    status: response.status,
    message: response.message,
  };
};

/**
 * Get running field for current user
 */
export const getRunningFieldForUser = async (): Promise<RunningFieldResponse | null> => {
  try {
    const response = await apiGet<RunningFieldResponse>("/get_running_field_for_user");
    return response.data;
  } catch (error) {
    // No running field
    return null;
  }
};

/**
 * Get field function introduction
 */
export const getFieldFunctionIntro = async (): Promise<string> => {
  const response = await apiGet<FieldFunctionIntroResponse>("/get_field_function_intro");
  return response.data.intro;
};

// Export fieldApi object for compatibility with demo code
export const fieldApi = {
  getAllFields,
  getAvailableFieldsForUser,
  createField,
  shutdownField,
  checkFlag,
  getRunningFieldForUser,
  getFieldFunctionIntro,
};
