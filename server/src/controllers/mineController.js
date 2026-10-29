import * as mineService from '../services/mineService.js';

export async function getMinesHandler(req, res) {
  try {
    const result = await mineService.getFilteredMines(req.query);
    res.json({
      success: true,
      summary: result.summary,
      count: result.count,
      data: result.data
    });
  } catch (error) {
    console.error("Error in getMinesHandler:", error);
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to retrieve mines directory" }
    });
  }
}

export async function getMineMapHandler(req, res) {
  try {
    const mapData = await mineService.getMineMapLocations(req.query);
    res.json({
      success: true,
      count: mapData.length,
      data: mapData
    });
  } catch (error) {
    console.error("Error in getMineMapHandler:", error);
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to retrieve mine map points" }
    });
  }
}

export async function getMineDetailHandler(req, res) {
  try {
    const { mineId } = req.params;
    const mine = await mineService.getMineById(mineId);

    if (!mine) {
      return res.status(404).json({
        success: false,
        error: { message: "Mine not found" }
      });
    }

    res.json({
      success: true,
      data: mine
    });
  } catch (error) {
    console.error("Error in getMineDetailHandler:", error);
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to retrieve mine details" }
    });
  }
}

export async function getMineSummaryHandler(req, res) {
  try {
    const { mineId } = req.params;
    const summary = await mineService.getMineSummaryMetrics(mineId);

    if (!summary) {
      return res.status(404).json({
        success: false,
        error: { message: "Mine not found" }
      });
    }

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error("Error in getMineSummaryHandler:", error);
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to calculate mine summary metrics" }
    });
  }
}

export async function getMineInspectionsHandler(req, res) {
  try {
    const { mineId } = req.params;
    const inspections = await mineService.getMineInspections(mineId);

    res.json({
      success: true,
      count: inspections.length,
      data: inspections
    });
  } catch (error) {
    console.error("Error in getMineInspectionsHandler:", error);
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to retrieve mine inspections" }
    });
  }
}

export async function getMineIncidentsHandler(req, res) {
  try {
    const { mineId } = req.params;
    const incidents = await mineService.getMineIncidents(mineId);

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

export async function getHighestAttentionMinesHandler(req, res) {
  try {
    const { getHighestAttentionMines } = await import('../services/mineAttentionService.js');
    const data = await getHighestAttentionMines(req.query);
    res.json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    console.error("Error in getHighestAttentionMinesHandler:", error);
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to calculate highest attention mines" }
    });
  }
}

