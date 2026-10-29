import * as incidentService from '../services/incidentService.js';

export async function getIncidentsHandler(req, res) {
  try {
    const result = await incidentService.getFilteredIncidents(req.query);
    res.json({
      success: true,
      summary: result.summary,
      pagination: result.pagination,
      data: result.data
    });
  } catch (error) {
    console.error("Error in getIncidentsHandler:", error);
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to retrieve incident records" }
    });
  }
}

export async function getIncidentDetailHandler(req, res) {
  try {
    const { submissionId } = req.params;
    const incident = await incidentService.getIncidentBySubmissionId(submissionId);

    if (!incident) {
      return res.status(404).json({
        success: false,
        error: { message: "Incident record not found" }
      });
    }

    res.json({
      success: true,
      data: incident
    });
  } catch (error) {
    console.error("Error in getIncidentDetailHandler:", error);
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to retrieve incident details" }
    });
  }
}

export async function getMineIncidentsHandler(req, res) {
  try {
    const { mineId } = req.params;
    const incidents = await incidentService.getMineIncidents(mineId);

    res.json({
      success: true,
      count: incidents.length,
      data: incidents
    });
  } catch (error) {
    console.error("Error in getMineIncidentsHandler:", error);
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to retrieve mine incidents" }
    });
  }
}
