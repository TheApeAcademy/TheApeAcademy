/**
 * Wrapper to catch async errors in Express route handlers
 * Usage: router.post('/path', asyncHandler(controller.action))
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
