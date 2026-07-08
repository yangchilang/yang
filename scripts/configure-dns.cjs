const https = require('https');

const accountId = '5fa2e567e14198137d715a6f1e7ca114';
const zoneName = 'tarot-yue.cn';
const pagesSubdomain = 'ai-tarot-reading-5ed.pages.dev';

function makeRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.success) {
            resolve(result);
          } else {
            reject(new Error(JSON.stringify(result.errors || result)));
          }
        } catch (e) {
          reject(new Error('Invalid response: ' + data));
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function getZoneId() {
  console.log('🔍 Getting zone ID for', zoneName);
  const options = {
    hostname: 'api.cloudflare.com',
    path: `/client/v4/zones?name=${zoneName}`,
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + process.argv[2] }
  };
  const result = await makeRequest(options);
  if (result.result.length === 0) {
    throw new Error('Zone not found');
  }
  return result.result[0].id;
}

async function listDnsRecords(zoneId) {
  console.log('📋 Listing DNS records');
  const options = {
    hostname: 'api.cloudflare.com',
    path: `/client/v4/zones/${zoneId}/dns_records`,
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + process.argv[2] }
  };
  const result = await makeRequest(options);
  return result.result;
}

async function deleteDnsRecord(zoneId, recordId) {
  console.log('🗑️ Deleting DNS record:', recordId);
  const options = {
    hostname: 'api.cloudflare.com',
    path: `/client/v4/zones/${zoneId}/dns_records/${recordId}`,
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + process.argv[2] }
  };
  await makeRequest(options);
  console.log('✅ Record deleted');
}

async function createCnameRecord(zoneId) {
  console.log('📤 Creating CNAME record pointing to', pagesSubdomain);
  const options = {
    hostname: 'api.cloudflare.com',
    path: `/client/v4/zones/${zoneId}/dns_records`,
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + process.argv[2],
      'Content-Type': 'application/json'
    }
  };
  const body = {
    type: 'CNAME',
    name: '@',
    content: pagesSubdomain,
    proxied: true,
    ttl: 1
  };
  const result = await makeRequest(options, body);
  console.log('✅ CNAME record created:', JSON.stringify(result.result, null, 2));
}

async function addPagesDomain(projectName, domain) {
  console.log('📝 Adding domain', domain, 'to Pages project', projectName);
  const options = {
    hostname: 'api.cloudflare.com',
    path: `/client/v4/accounts/${accountId}/pages/projects/${projectName}/domains`,
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + process.argv[2],
      'Content-Type': 'application/json'
    }
  };
  const body = { name: domain };
  const result = await makeRequest(options, body);
  console.log('✅ Domain added to Pages:', JSON.stringify(result.result, null, 2));
}

async function main() {
  if (!process.argv[2]) {
    console.error('❌ Please provide Cloudflare API token as argument');
    console.error('Usage: node scripts/configure-dns.cjs <api-token>');
    process.exit(1);
  }

  try {
    const zoneId = await getZoneId();
    console.log('✅ Zone ID:', zoneId);

    const records = await listDnsRecords(zoneId);
    console.log('📊 Current DNS records:');
    records.forEach(r => {
      console.log(`  - ${r.type} ${r.name} -> ${r.content} (ID: ${r.id})`);
    });

    const workerRecords = records.filter(r => r.type === 'CNAME' && r.content.includes('workers.dev'));
    const otherRecords = records.filter(r => r.name === '@' || r.name === zoneName);
    
    for (const record of otherRecords) {
      console.log(`\n⚠️  Found existing record: ${record.type} ${record.name}`);
      await deleteDnsRecord(zoneId, record.id);
    }

    await createCnameRecord(zoneId);
    
    await addPagesDomain('ai-tarot-reading', zoneName);

    console.log(`\n🎉 Successfully configured ${zoneName} to point to ${pagesSubdomain}`);
    console.log('⏳ Please wait 5-10 minutes for DNS to propagate and SSL certificate to be issued');
    console.log('🔗 Your site will be available at: https://tarot-yue.cn');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();