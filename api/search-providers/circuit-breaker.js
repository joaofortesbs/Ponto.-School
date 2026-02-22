const FAILURE_THRESHOLD = 3;
const FAILURE_WINDOW_MS = 5 * 60 * 1000;
const RECOVERY_TIMEOUT_MS = 10 * 60 * 1000;

const circuits = new Map();

function getCircuit(providerName) {
  if (!circuits.has(providerName)) {
    circuits.set(providerName, {
      state: 'CLOSED',
      failures: [],
      lastStateChange: Date.now(),
      halfOpenAttempted: false,
    });
  }
  return circuits.get(providerName);
}

function pruneOldFailures(circuit) {
  const cutoff = Date.now() - FAILURE_WINDOW_MS;
  circuit.failures = circuit.failures.filter(ts => ts > cutoff);
}

export function isProviderHealthy(providerName) {
  const circuit = getCircuit(providerName);

  if (circuit.state === 'CLOSED') {
    return true;
  }

  if (circuit.state === 'OPEN') {
    const elapsed = Date.now() - circuit.lastStateChange;
    if (elapsed >= RECOVERY_TIMEOUT_MS) {
      circuit.state = 'HALF_OPEN';
      circuit.halfOpenAttempted = false;
      circuit.lastStateChange = Date.now();
      console.log(`[CircuitBreaker] ${providerName}: OPEN → HALF_OPEN (attempting recovery)`);
      return !circuit.halfOpenAttempted;
    }
    return false;
  }

  if (circuit.state === 'HALF_OPEN') {
    if (!circuit.halfOpenAttempted) {
      circuit.halfOpenAttempted = true;
      return true;
    }
    return false;
  }

  return true;
}

export function recordSuccess(providerName) {
  const circuit = getCircuit(providerName);
  if (circuit.state === 'HALF_OPEN') {
    circuit.state = 'CLOSED';
    circuit.failures = [];
    circuit.lastStateChange = Date.now();
    console.log(`[CircuitBreaker] ${providerName}: HALF_OPEN → CLOSED (recovered)`);
  } else if (circuit.state === 'CLOSED') {
    pruneOldFailures(circuit);
  }
}

export function recordFailure(providerName) {
  const circuit = getCircuit(providerName);

  if (circuit.state === 'HALF_OPEN') {
    circuit.state = 'OPEN';
    circuit.lastStateChange = Date.now();
    circuit.halfOpenAttempted = false;
    console.warn(`[CircuitBreaker] ${providerName}: HALF_OPEN → OPEN (recovery failed)`);
    return;
  }

  if (circuit.state === 'OPEN') return;

  circuit.failures.push(Date.now());
  pruneOldFailures(circuit);

  if (circuit.failures.length >= FAILURE_THRESHOLD) {
    circuit.state = 'OPEN';
    circuit.lastStateChange = Date.now();
    console.warn(`[CircuitBreaker] ${providerName}: CLOSED → OPEN (${circuit.failures.length} failures in ${FAILURE_WINDOW_MS / 60000} min)`);
  }
}

export function getCircuitState(providerName) {
  return getCircuit(providerName).state;
}

export function getAllCircuitStates() {
  const result = {};
  for (const [name, circuit] of circuits.entries()) {
    pruneOldFailures(circuit);
    result[name] = {
      state: circuit.state,
      recent_failures: circuit.failures.length,
      last_change: new Date(circuit.lastStateChange).toISOString(),
    };
  }
  return result;
}
