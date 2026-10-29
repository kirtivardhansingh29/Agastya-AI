import * as attendanceService from '../services/attendanceService.js';

export async function getAttendanceHandler(req, res) {
  try {
    const result = await attendanceService.getFilteredAttendance(req.query);
    res.json({
      success: true,
      summary: result.summary,
      pagination: result.pagination,
      data: result.data
    });
  } catch (error) {
    console.error("Error in getAttendanceHandler:", error);
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to retrieve attendance records" }
    });
  }
}

export async function getMineAttendanceHandler(req, res) {
  try {
    const { mineId } = req.params;
    const result = await attendanceService.getLatestMineAttendance(mineId);

    res.json({
      success: true,
      latestRecord: result.latestRecord,
      metrics: result.metrics,
      data: result.records
    });
  } catch (error) {
    console.error("Error in getMineAttendanceHandler:", error);
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to retrieve mine attendance" }
    });
  }
}
