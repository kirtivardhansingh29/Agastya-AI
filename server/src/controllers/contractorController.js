import * as contractorService from '../services/contractorService.js';

export async function getContractorsHandler(req, res) {
  try {
    const result = await contractorService.getFilteredContractors(req.query);
    res.json({
      success: true,
      summary: result.summary,
      pagination: result.pagination,
      data: result.data
    });
  } catch (error) {
    console.error("Error in getContractorsHandler:", error);
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to retrieve contractor records" }
    });
  }
}

export async function getContractorDetailHandler(req, res) {
  try {
    const { contractorId } = req.params;
    const contractor = await contractorService.getContractorById(contractorId);

    if (!contractor) {
      return res.status(404).json({
        success: false,
        error: { message: "Contractor record not found" }
      });
    }

    res.json({
      success: true,
      data: contractor
    });
  } catch (error) {
    console.error("Error in getContractorDetailHandler:", error);
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to retrieve contractor details" }
    });
  }
}

export async function getMineContractorsHandler(req, res) {
  try {
    const { mineId } = req.params;
    const contractors = await contractorService.getMineContractors(mineId);

    res.json({
      success: true,
      count: contractors.length,
      data: contractors
    });
  } catch (error) {
    console.error("Error in getMineContractorsHandler:", error);
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to retrieve mine contractors" }
    });
  }
}
