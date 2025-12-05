/**
 * Test script for link extraction
 * Tests the extraction logic with detailed logging
 */

const testUrl = process.argv[2] || 'https://job.ceair.com/crew/crewIndex.html';

console.log('Testing link extraction...');
console.log('Target URL:', testUrl);
console.log('---');

fetch('http://localhost:3000/extract', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ url: testUrl })
})
  .then(res => res.json())
  .then(data => {
    console.log('\n=== RESULT ===');
    console.log('Success:', data.success);
    console.log('Total Links:', data.totalLinks);
    console.log('Source URL:', data.sourceUrl);
    
    if (data.error) {
      console.error('Error:', data.error);
    }
    
    if (data.data && data.data.length > 0) {
      console.log('\n=== FIRST 5 LINKS ===');
      data.data.slice(0, 5).forEach((link, i) => {
        console.log(`\n${i + 1}. ${link.description || link.anchorText || 'No description'}`);
        console.log(`   URL: ${link.url}`);
        console.log(`   Anchor: ${link.anchorText}`);
      });
    } else {
      console.log('\n⚠️  No links extracted!');
    }
  })
  .catch(err => {
    console.error('Request failed:', err.message);
  });
