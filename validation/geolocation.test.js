const geolocation = require('./geolocation')

test('geolocation in gatineau', async () => {
 expect(geolocation(45.43, -75.72)).toBe('gatineau');
});

test('geolocation in ottawa', async () => {
 expect(geolocation(45.4, -75.7)).toBe('ottawa');
});

test('geolocation undefined', async () => {
 expect(geolocation(65.4, 125.7)).toBeUndefined();
});
