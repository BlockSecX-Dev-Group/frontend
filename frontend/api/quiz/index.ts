import { apiPost } from "../utils";
import {
  GetChallengeQuestionsResponse,
  SubmitChallengeAnswersRequest,
  SubmitChallengeAnswersResponse,
  ChallengeQuestion,
} from "../types";

export interface QuizSession {
  questions: ChallengeQuestion[];
  sessionId: string;
  expireAt: string;
}

/**
 * Get challenge questions
 * Returns questions with session info for answer submission
 */
export const getChallengeQuestions = async (): Promise<QuizSession> => {
  const response = await apiPost<GetChallengeQuestionsResponse>(
    "/get-challenge-questions",
    {}
  );
  return {
    questions: response.data.questions,
    sessionId: response.data.session_id,
    expireAt: response.data.expire_at,
  };
};

/**
 * Submit challenge answers
 * @param sessionId - Session ID from getChallengeQuestions
 * @param answers - Object mapping question_id to answer (e.g., { "153": "A", "485": "B" })
 */
export const submitChallengeAnswers = async (
  sessionId: string,
  answers: Record<string, string>
): Promise<{ correctCount: number }> => {
  const request: SubmitChallengeAnswersRequest = {
    session_id: sessionId,
    user_answers: answers,
  };
  const response = await apiPost<SubmitChallengeAnswersResponse>(
    "/submit-challenge-answers",
    request
  );
  return {
    correctCount: response.data.correct_count,
  };
};
