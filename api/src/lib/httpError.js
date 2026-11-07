// Create an error that carries an HTTP status (and an optional code the React app can react to).
// The error handler turns it into a JSON reply.
export const httpError = (status, message, code) => Object.assign(new Error(message), { status, ...(code && { code }) });
