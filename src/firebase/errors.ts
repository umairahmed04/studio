'use client';

export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

/**
 * Custom error class for surfacing Firestore security rule context.
 */
export class FirestorePermissionError extends Error {
  context: SecurityRuleContext;

  constructor(context: SecurityRuleContext) {
    super(`Firestore Permission Denied: ${context.operation} on ${context.path}`);
    this.name = 'FirestorePermissionError';
    this.context = context;
  }
}
