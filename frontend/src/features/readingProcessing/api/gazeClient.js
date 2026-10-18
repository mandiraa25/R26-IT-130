/**
 * Client for the Python gaze service in the repo's eye-tracking folder.
 * useGazeTracking consumes samples and Calibration sends commands on one socket.
 */

const URL = import.meta.env.VITE_GAZE_WS_URL || "ws://127.0.0.1:8765";
const RECONNECT_MS = 1500;
const CONNECT_TIMEOUT_MS = 2500;
const PROBE_TTL_MS = 10_000;

const listeners = {
  sample: new Set(),
  status: new Set(),
  calibration: new Set(),
};

let socket = null;
let refCount = 0;
let reconnectTimer = null;
let connectTimer = null;
let available = null;
let decidedAt = 0;
let lastStatus = { state: "idle", calibrated: false, fps: 0, errorPx: null };
const availabilityWaiters = new Set();
let pending = [];

function emit(channel, payload) {
  for (const fn of listeners[channel]) {
    try {
      fn(payload);
    } catch (err) {
      console.error(`[gaze] ${channel} listener failed`, err);
    }
  }
}

function settleAvailability(value) {
  if (available === value) return;
  available = value;
  decidedAt = Date.now();
  for (const resolve of availabilityWaiters) resolve(value);
  availabilityWaiters.clear();
}

function open() {
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) return;

  let ws;
  try {
    ws = new WebSocket(URL);
  } catch {
    settleAvailability(false);
    scheduleReconnect();
    return;
  }
  socket = ws;

  clearTimeout(connectTimer);
  connectTimer = setTimeout(() => {
    if (ws.readyState === WebSocket.CONNECTING) {
      settleAvailability(false);
      ws.close();
    }
  }, CONNECT_TIMEOUT_MS);

  ws.onopen = () => {
    clearTimeout(connectTimer);
    settleAvailability(true);
    send({
      type: "hello",
      viewport: { w: window.innerWidth, h: window.innerHeight, dpr: window.devicePixelRatio },
    });
    const queued = pending;
    pending = [];
    for (const message of queued) send(message);
  };

  ws.onmessage = (event) => {
    let msg;
    try {
      msg = JSON.parse(event.data);
    } catch {
      return;
    }
    switch (msg.type) {
      case "gaze":
        emit("sample", { x: msg.x, y: msg.y, t: msg.t, conf: msg.conf });
        break;
      case "status":
        lastStatus = {
          state: msg.state,
          calibrated: !!msg.calibrated,
          fps: msg.fps ?? 0,
          errorPx: msg.error_px ?? null,
        };
        emit("status", lastStatus);
        break;
      case "calib.progress":
        emit("calibration", {
          kind: "progress",
          point: msg.point,
          collected: msg.collected,
          needed: msg.needed,
          reason: msg.reason ?? null,
        });
        break;
      case "calib.done":
        emit("calibration", { kind: "done", errorPx: msg.error_px, points: msg.points, samples: msg.samples });
        break;
      case "error":
        emit("calibration", { kind: "error", message: msg.message });
        break;
      default:
        break;
    }
  };

  ws.onclose = () => {
    clearTimeout(connectTimer);
    if (socket === ws) socket = null;
    if (available === null) settleAvailability(false);
    lastStatus = { ...lastStatus, state: "disconnected" };
    emit("status", lastStatus);
    scheduleReconnect();
  };
}

function scheduleReconnect() {
  if (refCount <= 0) return;
  clearTimeout(reconnectTimer);
  reconnectTimer = setTimeout(open, RECONNECT_MS);
}

function send(message) {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
    return true;
  }
  return false;
}

function sendOrQueue(message) {
  if (send(message)) return true;
  open();
  pending.push(message);
  if (pending.length > 32) pending.shift();
  return false;
}

export const gazeClient = {
  acquire() {
    refCount += 1;
    open();
    let released = false;
    return () => {
      if (released) return;
      released = true;
      refCount -= 1;
      if (refCount <= 0) {
        clearTimeout(reconnectTimer);
        clearTimeout(connectTimer);
        socket?.close();
        socket = null;
      }
    };
  },

  probe() {
    if (available === true) return Promise.resolve(true);
    if (available === false && Date.now() - decidedAt < PROBE_TTL_MS) return Promise.resolve(false);
    available = null;
    open();
    return new Promise((resolve) => {
      availabilityWaiters.add(resolve);
      setTimeout(() => {
        if (availabilityWaiters.delete(resolve)) resolve(available === true);
      }, CONNECT_TIMEOUT_MS + 250);
    });
  },

  get status() {
    return lastStatus;
  },

  on(channel, fn) {
    listeners[channel].add(fn);
    return () => listeners[channel].delete(fn);
  },

  beginCalibration() {
    return sendOrQueue({ type: "calib.begin" });
  },
  calibrationPoint(x, y) {
    return sendOrQueue({ type: "calib.point", x, y });
  },
  fitCalibration() {
    return sendOrQueue({ type: "calib.fit" });
  },
  clearCalibration() {
    return sendOrQueue({ type: "calib.clear" });
  },
};
