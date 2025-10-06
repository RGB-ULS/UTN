function doPost(e) {
  try {
    console.log('=== GOOGLE APPS SCRIPT WEBHOOK HANDLER ===');
    console.log('Received POST request');
    console.log('Content type:', e.postData.type);
    console.log('Raw contents:', e.postData.contents);
    
    let data;
    
    // Handle different content types
    if (e.postData.type === 'application/json') {
      // JSON format
      console.log('Parsing as JSON...');
      data = JSON.parse(e.postData.contents);
      console.log('Parsed JSON data:', data);
    } else if (e.postData.type === 'application/x-www-form-urlencoded') {
      // Form-encoded format
      console.log('Parsing as form-encoded data...');
      data = {};
      const params = e.postData.contents.split('&');
      for (let param of params) {
        const [key, value] = param.split('=');
        if (key && value !== undefined) {
          data[decodeURIComponent(key)] = decodeURIComponent(value || '');
        }
      }
      console.log('Parsed form data:', data);
    } else {
      // Try to parse as JSON anyway (fallback)
      console.log('Unknown content type, trying JSON fallback...');
      try {
        data = JSON.parse(e.postData.contents);
        console.log('Fallback JSON parse successful:', data);
      } catch (jsonError) {
        console.error('Could not parse data:', jsonError);
        console.error('Raw content was:', e.postData.contents);
        throw new Error('Unsupported content type: ' + e.postData.type + '. Could not parse as JSON either.');
      }
    }
    
    // Validate that we have some data
    if (!data || typeof data !== 'object') {
      throw new Error('No valid data received');
    }
    
    console.log('Final parsed data:', JSON.stringify(data, null, 2));
    
    // Open the spreadsheet
    const spreadsheetId = '1f9ASKmDLoJNTAs85NMUL896IMFLm5m5MycZ5Pz199Bc';
    console.log('Opening spreadsheet:', spreadsheetId);
    const sheet = SpreadsheetApp.openById(spreadsheetId).getActiveSheet();
    
    // Prepare the row data - handle both old and new field names
    const rowData = [
      data.licensePlate || data.license_plate || '',
      data.store || '',
      data.time || '',
      data.leadType || data.lead_type || '',
      data.repEmail || data.rep_email || '',
      data.firstName || data.first_name || '',
      data.lastName || data.last_name || '',
      data.email || '',
      data.phoneNumber || data.phone_number || '',
      data.zipCode || data.zip_code || '',
      data.imageUrl || data.image_url || data.image || '',
      data.timestamp || new Date().toISOString()
    ];
    
    console.log('Prepared row data:', rowData);
    
    // Add the row to the sheet
    sheet.appendRow(rowData);
    
    console.log('Successfully added row to sheet');
    console.log('=== SUCCESS ===');
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Data successfully added to sheet',
        rowData: rowData,
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('=== ERROR IN GOOGLE APPS SCRIPT ===');
    console.error('Error details:', error.toString());
    console.error('Error stack:', error.stack);
    
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString(),
        message: 'Failed to process request',
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Test function to verify the script works
function testScript() {
  console.log('=== TESTING GOOGLE APPS SCRIPT ===');
  
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
  
  console.log('Test data:', testData);
  
  try {
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
    console.log('Row data:', rowData);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Function to check sheet headers (run this once to verify column order)
function checkHeaders() {
  console.log('=== CHECKING SHEET HEADERS ===');
  
  try {
    const sheet = SpreadsheetApp.openById('1f9ASKmDLoJNTAs85NMUL896IMFLm5m5MycZ5Pz199Bc').getActiveSheet();
    const headers = sheet.getRange(1, 1, 1, 12).getValues()[0];
    
    console.log('Current headers:', headers);
    console.log('Expected order:');
    console.log('1. License Plate');
    console.log('2. Store');
    console.log('3. Time');
    console.log('4. Lead Type');
    console.log('5. Rep Email');
    console.log('6. First Name');
    console.log('7. Last Name');
    console.log('8. Email');
    console.log('9. Phone Number');
    console.log('10. Zip Code');
    console.log('11. Image URL');
    console.log('12. Timestamp');
    
  } catch (error) {
    console.error('Error checking headers:', error);
  }
}