# Lead Management Form

A comprehensive lead management form application that integrates with n8n workflows and Google Sheets.

## Features

- **Webhook Integration**: Receives lead data from n8n workflows
- **Two-Step Form Process**: Lead information → Customer details (when applicable)
- **Google Sheets Integration**: Automatically stores all submissions
- **Form Validation**: Email and US phone number validation
- **Image Display**: Shows images from URLs in webhook payload
- **Responsive Design**: Works on all devices

## Form Fields

### Step 1: Lead Information
- **Image**: Displays image from webhook URL
- **License Plate**: Text input for vehicle identification
- **Store**: Store location
- **Time**: Date/time picker
- **Lead Type**: Dropdown (Customer, Vendor, Employee, Other)

### Step 2: Customer Details (Only for Customer leads)
- **First Name**: Required text input
- **Last Name**: Required text input  
- **Email**: Validated email address
- **Phone Number**: US format validation with auto-formatting
- **Zip Code**: US zip code validation

## Webhook Integration

The application receives webhook data via Supabase Edge Function at:
`https://nrzfuqikeuyhmdhaagpo.supabase.co/functions/v1/webhook`

Send POST requests with the following payload structure:

```json
{
  "imageUrl": "https://example.com/image.jpg",
  "licensePlate": "ABC-123",
  "store": "Downtown Branch",
  "time": "2025-01-08T10:30:00Z",
  "leadType": "Customer"
}
```

## Google Sheets Integration

All submissions are automatically stored with the following columns:
- License Plate
- Store
- Time
- Lead Type
- First Name (if customer)
- Last Name (if customer)
- Email (if customer)
- Phone Number (if customer)
- Zip Code (if customer)
- Image URL

## Testing

Visit `/webhook-test.html` to simulate webhook data submission during development.

## Setup Instructions

1. **Google Sheets API**: 
   
   **Option 1: Google Apps Script Web App (Recommended)**
   - Create a new Google Apps Script project
   - Add the following code to handle POST requests:
   ```javascript
   function doPost(e) {
     try {
       const data = JSON.parse(e.postData.contents);
       const sheet = SpreadsheetApp.openById('YOUR_SPREADSHEET_ID').getActiveSheet();
       
       sheet.appendRow([
         data.licensePlate,
         data.store,
         data.time,
         data.leadType,
         data.firstName,
         data.lastName,
         data.email,
         data.phoneNumber,
         data.zipCode,
         data.imageUrl,
         data.timestamp
       ]);
       
       return ContentService.createTextOutput(JSON.stringify({success: true}));
     } catch (error) {
       return ContentService.createTextOutput(JSON.stringify({error: error.toString()}));
     }
   }
   ```
   - Deploy as web app with "Anyone" access
   - Copy the web app URL to VITE_GOOGLE_WEB_APP_URL
   
   **Option 2: Google Sheets API**
   - Create a Google Cloud Project
   - Enable Google Sheets API
   - Create API key
   - Set VITE_GOOGLE_SHEETS_ID and VITE_GOOGLE_API_KEY

2. **n8n Webhook Configuration**:
   - Set webhook URL to: `https://nrzfuqikeuyhmdhaagpo.supabase.co/functions/v1/webhook`
   - Configure payload format as shown above
   - Test with the provided test page

## Development

```bash
npm run dev
```

The application will start on `http://localhost:5173`

For webhook testing, visit: `http://localhost:5173/webhook-test.html`