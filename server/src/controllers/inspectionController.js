import * as inspectionService from '../services/inspectionService.js';

export async function getInspectionsHandler(req, res) {
  try {
    const result = await inspectionService.getFilteredInspections(req.query);
    res.json({
      success: true,
      summary: result.summary,
      pagination: result.pagination,
      data: result.data
    });
  } catch (error) {
    console.error("Error in getInspectionsHandler:", error);
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to retrieve inspections directory" }
    });
  }
}

export async function getInspectionDetailHandler(req, res) {
  try {
    const { submissionId } = req.params;
    const inspection = await inspectionService.getInspectionBySubmissionId(submissionId);

    if (!inspection) {
      return res.status(404).json({
        success: false,
        error: { message: "Inspection not found" }
      });
    }

    res.json({
      success: true,
      data: inspection
    });
  } catch (error) {
    console.error("Error in getInspectionDetailHandler:", error);
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to retrieve inspection details" }
    });
  }
}

export async function getViolationsHandler(req, res) {
  try {
    const result = await inspectionService.getFilteredViolations(req.query);
    res.json({
      success: true,
      summary: result.summary,
      pagination: result.pagination,
      data: result.data
    });
  } catch (error) {
    console.error("Error in getViolationsHandler:", error);
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to retrieve safety violations" }
    });
  }
}

export async function getCorrectiveActionsHandler(req, res) {
  try {
    const result = await inspectionService.getFilteredCorrectiveActions(req.query);
    res.json({
      success: true,
      summary: result.summary,
      pagination: result.pagination,
      data: result.data
    });
  } catch (error) {
    console.error("Error in getCorrectiveActionsHandler:", error);
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to retrieve corrective actions" }
    });
  }
}

export async function getMineViolationsHandler(req, res) {
  try {
    const { mineId } = req.params;
    const violations = await inspectionService.getMineViolations(mineId);

    res.json({
      success: true,
      count: violations.length,
      data: violations
    });
  } catch (error) {
    console.error("Error in getMineViolationsHandler:", error);
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to retrieve mine violations" }
    });
  }
}
