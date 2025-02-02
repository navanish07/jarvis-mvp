export const logger = {
    log: (...args) => {
      console.log(...args);
      // If running on server
      if (typeof window === 'undefined') {
        process.stdout.write(`${args.join(' ')}\n`);
      }
    },
    error: (...args) => {
      console.error(...args);
      if (typeof window === 'undefined') {
        process.stderr.write(`${args.join(' ')}\n`);
      }
    }
};