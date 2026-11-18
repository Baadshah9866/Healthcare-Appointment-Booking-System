const generateSlots = (startTime, endTime, slotDurationMinutes) => {
  const slots = [];
  const start = new Date(`1970-01-01T${startTime}:00Z`);
  const end = new Date(`1970-01-01T${endTime}:00Z`);
  const durationInMs = slotDurationMinutes * 60 * 1000;

  let currentSlot = start;

  while (currentSlot < end) {
    const hours = String(currentSlot.getUTCHours()).padStart(2, '0');
    const minutes = String(currentSlot.getUTCMinutes()).padStart(2, '0');
    slots.push(`${hours}:${minutes}`);
    currentSlot = new Date(currentSlot.getTime() + durationInMs);
  }

  return slots;
};

module.exports = { generateSlots };
