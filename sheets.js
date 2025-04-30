// Code.gs
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Parse the incoming POST data
    var data = JSON.parse(e.postData.contents);

    // Get current timestamp
    var timestamp = new Date();

    // Prepare the row data
    // Ensure the order matches the columns in your Google Sheet
    var rowData = [
      timestamp,
      data.email || '', // Email is required, but good practice to handle potential undefined
      data.paymentType || '',
      data.fairValue || '',
      data.databases ? data.databases.join(', ') : '', // Join array into string
      data.teamSize || ''
    ];

    // Append data to the sheet
    sheet.appendRow(rowData);

    // Return a success response
    return ContentService
      .createTextOutput(JSON.stringify({ "result": "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Log the error for debugging
    Logger.log(error.toString());

    // Return an error response
    return ContentService
      .createTextOutput(JSON.stringify({ "result": "error", "error": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}