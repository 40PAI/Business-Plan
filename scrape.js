import fs from 'fs';
const url = 'https://api.firecrawl.dev/v1/scrape';
const apiKey = 'fc-18ebce7ea55a483bb6fb219f6dad9068';
const targetUrl = 'https://businessplan-delta.vercel.app/';

fetch(url, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
        url: targetUrl,
        formats: ['markdown']
    })
})
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            fs.writeFileSync('scraped_content.md', data.data.markdown);
            console.log("MARKDOWN SAVED TO scraped_content.md");
        } else {
            console.error("ERROR:\n", data);
        }
    })
    .catch(err => console.error(err));
