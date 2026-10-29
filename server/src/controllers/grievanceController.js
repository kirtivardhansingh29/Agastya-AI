import * as grievanceService from '../services/grievanceService.js';

export async function getGrievancesHandler(req, res) {
  try {
    const result = await grievanceService.getFilteredGrievances(req.query);
    res.json({
      success: true,
      summary: result.summary,
      pagination: result.pagination,
      data: result.data
    });
  } catch (error) {
    console.error("Error in getGrievancesHandler:", error);
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to retrieve grievance records" }
    });
  }
}

export async function getGrievanceDetailHandler(req, res) {
  try {
    const { submissionId } = req.params;
    const grievance = await grievanceService.getGrievanceBySubmissionId(submissionId);

    if (!grievance) {
      return res.status(404).json({
        success: false,
        error: { message: "Grievance record not found" }
      });
    }

    res.json({
      success: true,
      data: grievance
    });
  } catch (error) {
    console.error("Error in getGrievanceDetailHandler:", error);
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to retrieve grievance details" }
    });
  }
}

export async function getMineGrievancesHandler(req, res) {
  try {
    const { mineId } = req.params;
    const grievances = await grievanceService.getMineGrievances(mineId);

    res.json({
      success: true,
      count: grievances.length,
      data: grievances
    });
  } catch (error) {
    console.error("Error in getMineGrievancesHandler:", error);
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to retrieve mine grievances" }
    });
  }
}
