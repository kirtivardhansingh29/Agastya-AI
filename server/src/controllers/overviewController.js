import * as overviewService from '../services/overviewService.js';

export async function getOverview(req, res) {
  try {
    const filters = {
      state: req.query.state || 'ALL',
      district: req.query.district,
      scope: req.query.scope,
      severity: req.query.severity
    };
    const data = await overviewService.getOverviewSummary(filters);
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data
    });
  } catch (error) {
    console.error("Error in getOverview controller:", error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || "Unable to calculate regulatory overview telemetry"
      }
    });
  }
}

export async function getIncidents(req, res) {
  try {
    const filter = req.query.filter || 'all';
    const incidents = await overviewService.getRecentIncidents(filter);
    res.json({
      success: true,
      count: incidents.length,
      data: incidents
    });
  } catch (error) {
    console.error("Error in getIncidents controller:", error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || "Unable to retrieve incident reports"
      }
    });
  }
}

export async function syncData(req, res) {
  try {
    const result = await overviewService.triggerDataSync();
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Error in syncData controller:", error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || "Data synchronization failed"
      }
    });
  }
}
