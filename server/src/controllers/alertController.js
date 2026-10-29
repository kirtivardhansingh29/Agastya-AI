import { getAlerts as fetchAlerts } from '../services/alertService.js';

export async function getAlerts(req, res) {
  try {
    const filters = {
      category: req.query.category,
      severity: req.query.severity,
      search: req.query.search
    };

    const data = await fetchAlerts(filters);
    return res.status(200).json({
      success: true,
      count: data.totalCount,
      data
    });
  } catch (error) {
    console.error("Error fetching operational alerts:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch high-priority alerts"
    });
  }
}
