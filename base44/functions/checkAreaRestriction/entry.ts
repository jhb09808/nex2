import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

function distanceMiles(lat1, lon1, lat2, lon2) {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { latitude, longitude } = await req.json();
    if (latitude == null || longitude == null) {
      return Response.json({ restricted: false });
    }

    const zones = await base44.asServiceRole.entities.GeoZone.filter({ is_restricted: true });
    for (const zone of zones) {
      const dist = distanceMiles(latitude, longitude, zone.latitude, zone.longitude);
      if (dist <= (zone.radius_miles || 0.25)) {
        return Response.json({
          restricted: true,
          zone_name: zone.name,
          reason: zone.restriction_reason || 'This area has access restrictions.',
        });
      }
    }

    return Response.json({ restricted: false });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});