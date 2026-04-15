const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function req(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  getEmployees:    ()               => req('GET',    '/employees'),
  getSeats:        ()               => req('GET',    '/seats'),
  getBookings:     (date)           => req('GET',    `/bookings?date=${date}`),
  getMyBookings:   (empId)          => req('GET',    `/my-bookings?employee_id=${empId}`),
  getWeekInfo:     (date)           => req('GET',    `/week-info?date=${date}`),
  getAvailability: (dates)          => req('GET',    `/availability?dates=${dates.join(',')}`),
  getHolidays:     (year)           => req('GET',    year ? `/holidays?year=${year}` : '/holidays'),
  book:            (body)           => req('POST',   '/book', body),
  cancelBooking:   (id, employeeId) => req('DELETE', `/booking/${id}`, { employee_id: employeeId }),
  toggleBlock:     (seatId, block)  => req('PATCH',  `/seat/${seatId}/block`, { block }),
};
