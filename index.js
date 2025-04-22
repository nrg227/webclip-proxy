import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Replace with your actual Notion token and database ID
const NOTION_TOKEN = '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';
const DATABASE_ID = '1ce82d58cd60801f9144f6b527625de4';

app.use(cors());
app.use(express.json());

app.post('/save', async (req, res) => {
  const { docName, url, category, company, status } = req.body;

  try {
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        parent: { database_id: DATABASE_ID },
        properties: {
          'Doc name': {
            title: [
              {
                text: {
                  content: docName
                }
              }
            ]
          },
          'URL': {
            url: url
          },
          'Category': { 
            multi_select: [
            { name: category }
            ]
          },
          'Company': {
            multi_select: [
            { name: company }
            ]
          },
          'Status': {
            status: {
              name: status
            }
          }
        }
      })
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error saving to Notion:', error);
    res.status(500).json({ error: 'Failed to save to Notion' });
  }
});

app.get('/options', async (req, res) => {
  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}`, {
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28'
      }
    });

    const data = await response.json();

    console.log("📦 Full Notion response:", JSON.stringify(data, null, 2)); // 🔍 log this

    // This will fail if properties aren't what we expect
    const companyOptions = data.properties.Company.multi_select.options.map(opt => opt.name);
    const categoryOptions = data.properties.Category.multi_select.options.map(opt => opt.name);

    res.json({ companyOptions, categoryOptions });
  } catch (error) {
    console.error("❌ Error in /options:", error);
    res.status(500).json({
      error: 'Failed to fetch Notion options',
      details: error.message
    });
  }
});



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
