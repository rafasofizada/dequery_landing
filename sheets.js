// Code.gs - Updated for JSONP and new parameters
function doGet(e) { // Changed to doGet as JSONP makes GET requests
  // Log all parameters received for debugging
  Logger.log(JSON.stringify(e.parameters));

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Get parameters using e.parameter (for single values) and e.parameters (for multiple)
    var email = e.parameter.email || '';
    var paymentTypes = e.parameters.paymentType || []; // Array of selected types
    var fairValueMonthly = e.parameter.fairValueMonthly || '';
    var fairValueLifetime = e.parameter.fairValueLifetime || '';
    var databases = e.parameters.db || []; // Array of selected databases
    var teamSize = e.parameter.teamSize || '';
    var callback = e.parameter.callback; // Get the JSONP callback function name

    // Get current timestamp
    var timestamp = new Date();

    // Prepare the row data - adjust column order as needed for your sheet
    var rowData = [
      timestamp,
      email,
      paymentTypes.join(', '), // Join multiple payment types into a comma-separated string
      fairValueMonthly,
      fairValueLifetime,
      databases.join(', '), // Join multiple databases into a comma-separated string
      teamSize
    ];

    // Append data to the sheet
    sheet.appendRow(rowData);

    // Return a success response using JSONP format
    var jsonResponse = JSON.stringify({ "result": "success" });
    var response = callback + '(' + jsonResponse + ')';
    return ContentService.createTextOutput(response).setMimeType(ContentService.MimeType.JAVASCRIPT);

  } catch (error) {
    // Log the error for debugging
    Logger.log("Error: " + error.toString());
    Logger.log("Parameters: " + JSON.stringify(e.parameters)); // Log parameters on error too

    // Return an error response using JSONP format
    var jsonErrorResponse = JSON.stringify({ "result": "error", "error": error.toString() });
    var errorResponse = callback ? callback + '(' + jsonErrorResponse + ')' : jsonErrorResponse;
    // Fallback if no callback provided, though unlikely with the client setup
    return ContentService.createTextOutput(errorResponse).setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

// Keep doPost for potential future use or other integrations, 
// but it won't be called by the current JSONP implementation.
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    var timestamp = new Date();
    // This structure is now outdated for the landing page form
    var rowData = [
      timestamp,
      data.email || '',
      data.paymentType || '', // Might be multiple now
      data.fairValueMonthly || '', // New field
      data.fairValueLifetime || '',// New field
      data.databases ? (Array.isArray(data.databases) ? data.databases.join(', ') : data.databases) : '', // Handle array or string
      data.teamSize || '',
    ];
    sheet.appendRow(rowData);
    return ContentService.createTextOutput(JSON.stringify({ "result": "success" })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log(error.toString());
    return ContentService.createTextOutput(JSON.stringify({ "result": "error", "error": error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}