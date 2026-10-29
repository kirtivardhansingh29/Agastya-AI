import { getReportsAnalytics } from '../services/reportService.js';

export async function getReports(req, res) {
  try {
    const filters = {
      state: req.query.state,
      district: req.query.district,
      mineId: req.query.mineId || req.query.mine_id,
      riskLevel: req.query.riskLevel || req.query.risk_level,
      startDate: req.query.startDate || req.query.start_date,
      endDate: req.query.endDate || req.query.end_date
    };

    const data = await getReportsAnalytics(filters);
    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error("Error generating reports analytics:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to generate graphical report analytics"
    });
  }
}
