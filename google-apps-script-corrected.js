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
    
    // CRITICAL: Open the spreadsheet and get the SPECIFIC "Leads" sheet by name
    const spreadsheetId = '1f9ASKmDLoJNTAs85NMUL896IMFLm5m5MycZ5Pz199Bc';
    console.log('Opening spreadsheet:', spreadsheetId);
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    
    // Get the "Leads" sheet specifically by name (NOT getActiveSheet!)
    let sheet = spreadsheet.getSheetByName('Leads');
    
    // If "Leads" sheet doesn't exist, create it
    if (!sheet) {
      console.log('Leads sheet not found, creating it...');
      sheet = spreadsheet.insertSheet('Leads');
      
      // Add headers to the new sheet
      const headers = [
        'License Plate', 'Store', 'Time', 'Lead Type', 'Rep Email',
        'First Name', 'Last Name', 'Email', 'Phone Number', 'Zip Code',
        'Image URL', 'Notes', 'Timestamp'
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      console.log('Added headers to new Leads sheet');
    }
    
    console.log('USING SHEET:', sheet.getName(), '- NOT Sheet1!');
    
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
      data.notes || '',
      data.timestamp || new Date().toISOString()
    ];
    
    console.log('Prepared row data:', rowData);
    console.log('Adding to sheet:', sheet.getName());
    
    // Add the row to the LEADS sheet (not Sheet1)
    sheet.appendRow(rowData);
    
    // Get the last row to confirm it was added
    const lastRow = sheet.getLastRow();
    console.log('Successfully added row to sheet:', sheet.getName());
    console.log('Sheet now has', lastRow, 'rows');
    console.log('=== SUCCESS - DATA ADDED TO LEADS SHEET ===');
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Data successfully added to Leads sheet (NOT Sheet1)',
        sheetName: sheet.getName(),
        rowData: rowData,
        lastRow: lastRow,
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

// Test function to verify the script works with LEADS sheet
function testScript() {
  console.log('=== TESTING GOOGLE APPS SCRIPT - LEADS SHEET ===');
  
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
    notes: 'Test notes',
    timestamp: new Date().toISOString()
  };
  
  console.log('Test data:', testData);
  
  try {
    const spreadsheet = SpreadsheetApp.openById('1f9ASKmDLoJNTAs85NMUL896IMFLm5m5MycZ5Pz199Bc');
    let sheet = spreadsheet.getSheetByName('Leads');
    
    if (!sheet) {
      console.log('Creating Leads sheet for test...');
      sheet = spreadsheet.insertSheet('Leads');
      const headers = [
        'License Plate', 'Store', 'Time', 'Lead Type', 'Rep Email',
        'First Name', 'Last Name', 'Email', 'Phone Number', 'Zip Code',
        'Image URL', 'Notes', 'Timestamp'
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
    
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
      testData.notes,
      testData.timestamp
    ];
    
    sheet.appendRow(rowData);
    const lastRow = sheet.getLastRow();
    
    console.log('Test data added successfully to sheet:', sheet.getName());
    console.log('Row data:', rowData);
    console.log('Sheet now has', lastRow, 'rows');
    console.log('CONFIRMED: Writing to LEADS sheet, not Sheet1');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Function to list all sheets in the spreadsheet
function listSheets() {
  console.log('=== LISTING ALL SHEETS ===');
  
  try {
    const spreadsheet = SpreadsheetApp.openById('1f9ASKmDLoJNTAs85NMUL896IMFLm5m5MycZ5Pz199Bc');
    const sheets = spreadsheet.getSheets();
    
    console.log('Found', sheets.length, 'sheets:');
    sheets.forEach((sheet, index) => {
      console.log(`${index + 1}. ${sheet.getName()} (${sheet.getLastRow()} rows)`);
      if (sheet.getName() === 'Leads') {
        console.log('   ✅ LEADS SHEET FOUND - This is where data should go');
      }
      if (sheet.getName() === 'Sheet1') {
        console.log('   ❌ Sheet1 found - Data should NOT go here');
      }
    });
    
  } catch (error) {
    console.error('Error listing sheets:', error);
  }
}

// Function to force create Leads sheet with headers
function createLeadsSheet() {
  console.log('=== CREATING LEADS SHEET ===');
  
  try {
    const spreadsheet = SpreadsheetApp.openById('1f9ASKmDLoJNTAs85NMUL896IMFLm5m5MycZ5Pz199Bc');
    
    // Check if Leads sheet already exists
    let sheet = spreadsheet.getSheetByName('Leads');
    
    if (sheet) {
      console.log('Leads sheet already exists');
      return;
    }
    
    // Create the Leads sheet
    sheet = spreadsheet.insertSheet('Leads');
    
    // Add headers
    const headers = [
      'License Plate', 'Store', 'Time', 'Lead Type', 'Rep Email',
      'First Name', 'Last Name', 'Email', 'Phone Number', 'Zip Code',
      'Image URL', 'Notes', 'Timestamp'
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    console.log('Leads sheet created successfully with headers');
    console.log('Headers:', headers);
    
  } catch (error) {
    console.error('Error creating Leads sheet:', error);
  }
}