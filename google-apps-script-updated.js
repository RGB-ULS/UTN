function doPost(e) {
  try {
    console.log('Received POST request');
    console.log('Content type:', e.postData.type);
    console.log('Raw contents:', e.postData.contents);
    
    let data;
    
    // Handle different content types
    if (e.postData.type === 'application/json') {
      // JSON format
      data = JSON.parse(e.postData.contents);
      console.log('Parsed JSON data:', data);
    } else if (e.postData.type === 'application/x-www-form-urlencoded') {
      // Form-encoded format
      data = {};
      const params = e.postData.contents.split('&');
      for (let param of params) {
        const [key, value] = param.split('=');
        data[decodeURIComponent(key)] = decodeURIComponent(value || '');
      }
      console.log('Parsed form data:', data);
    } else {
      // Try to parse as JSON anyway
      try {
        data = JSON.parse(e.postData.contents);
        console.log('Fallback JSON parse successful:', data);
      } catch (jsonError) {
        console.error('Could not parse data:', jsonError);
        throw new Error('Unsupported content type: ' + e.postData.type);
      }
    }
    
    // Open the spreadsheet
    const sheet = SpreadsheetApp.openById('1f9ASKmDLoJNTAs85NMUL896IMFLm5m5MycZ5Pz199Bc').getActiveSheet();
    
    // Prepare the row data
    const rowData = [
      data.licensePlate || '',
      data.store || '',
      data.time || '',
      data.leadType || '',
      data.repEmail || '',
      data.firstName || '',
      data.lastName || '',
      data.email || '',
      data.phoneNumber || '',
      data.zipCode || '',
      data.imageUrl || '',
      data.timestamp || new Date().toISOString()
    ];
    
    console.log('Adding row to sheet:', rowData);
    
    // Add the row to the sheet
    sheet.appendRow(rowData);
    
    console.log('Successfully added row to sheet');
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Data successfully added to sheet',
        rowData: rowData
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error in doPost:', error);
    
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString(),
        message: 'Failed to process request'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Test function to verify the script works
function testScript() {
  const testData = {
    licensePlate: 'TEST123',
    store: 'Test Store',
    time: new Date().toISOString(),
    leadType: 'Customer',
    repEmail: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phoneNumber: '555-1234',
    zipCode: '12345',
    imageUrl: 'https://example.com/image.jpg',
    timestamp: new Date().toISOString()
  };
  
  const sheet = SpreadsheetApp.openById('1f9ASKmDLoJNTAs85NMUL896IMFLm5m5MycZ5Pz199Bc').getActiveSheet();
  
  const rowData = [
    testData.licensePlate,
    testData.store,
    testData.time,
    testData.leadType,
    testData.repEmail,
    testData.firstName,
    testData.lastName,
    testData.email,
    testData.phoneNumber,
    testData.zipCode,
    testData.imageUrl,
    testData.timestamp
  ];
  
  sheet.appendRow(rowData);
  console.log('Test data added successfully');
}