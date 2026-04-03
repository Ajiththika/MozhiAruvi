import { EventEmitter } from 'events';

// ── Event-Driven Blueprint ──────────────────────────────────────────────────
// Mozhi Aruvi Central Event Hub
// ─────────────────────────────────────────────────────────────────────────────

const mozhiEvents = new EventEmitter();

// Log every event for transparency (Admin Dashboard Ready)
mozhiEvents.on('error', (err) => {
    console.error('Mozhi Event Hub Error:', err);
});

// Helper for emitting events with a standardized format
export const emitMozhiEvent = (event, data) => {
    console.log(`[EVENT] ${event} emitted for user: ${data.email || 'System'}`);
    mozhiEvents.emit(event, data);
};

export default mozhiEvents;
