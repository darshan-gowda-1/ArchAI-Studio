/**
 * ArchAI Studio v3 - Shared Custom Errors
 */

export class ValidationError extends Error {
  public details: Record<string, any>;
  constructor(message: string, details: Record<string, any> = {}) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

export class ConstraintViolationError extends Error {
  public violationCode: string;
  constructor(violationCode: string, message: string) {
    super(message);
    this.name = 'ConstraintViolationError';
    this.violationCode = violationCode;
  }
}
