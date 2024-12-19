const domains = [
  'https://www.okx.com',
  'https://www.okx.ac',
];

const abortSignalTimeout = (ms: number): AbortSignal => {
  const ctrl = new AbortController();
  setTimeout(() => ctrl.abort(), ms);
  return ctrl.signal;
};

const checkDomain = (domain: string, timeout = 5000): Promise<void | string> => {
  if (!domain) {
    return Promise.resolve();
  }
  return fetch(domain, { signal: abortSignalTimeout(timeout) })
    .then(response => {
      if (response.ok) {
        return domain;
      } else {
        const nextDomain = domains[domains.indexOf(domain) + 1];
        return checkDomain(nextDomain, timeout);
      }
    })
    .catch(() => {
      const nextDomain = domains[domains.indexOf(domain) + 1];
      return checkDomain(nextDomain, timeout);
    });
};

// Start checking domains
export function fetchDomain(): Promise<void | string> {
  return checkDomain(domains[0]);
}