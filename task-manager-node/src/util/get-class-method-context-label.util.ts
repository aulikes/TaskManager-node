/**
 * Genera una etiqueta contextual para logs basada en clase y método.
 */
export function getClassMethodContextLabel(context: object, prefix = ''): string {
  const className = context?.constructor?.name || 'UnknownClass';
  const stack = new Error().stack?.split('\n') ?? [];
  const callerLine = stack[2] ?? '';

  const methodMatch = callerLine.match(/at\s+([^\s]+)\s/);
  const methodName = methodMatch ? methodMatch[1].split('.').pop() : 'anonymous';

  return prefix ? `[${prefix}] ${className}.${methodName}` : `${className}.${methodName}`;
}