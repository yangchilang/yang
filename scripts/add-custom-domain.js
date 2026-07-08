const { execSync } = require('child_process');
const https = require('https');

const accountId = '5fa2e567e14198137d715a6f1e7ca114';
const projectName = 'ai-tarot-reading';
const customDomain = 'tarot-yue.cn';
const pagesSubdomain = 'ai-tarot-reading-5ed.pages.dev';

function getWranglerToken() {
  try {
    const configPath = `${process.env.APPDATA}\\.wrangler\\config.toml`;
    const fs = require('fs');
    if (fs.existsSync(configPath)) {
      const config = fs.readFileSync(configPath, 'utf8');
      const match = config.match(/token\s*=\s*["']([^"']+)["']/);
      if (match) return match[1];
    }
  } catch (e) {}
  
  try {
    const configPath = `${process.env.USERPROFILE}\\.wrangler\\config.toml`;
    const fs = require('fs');
    if (fs.existsSync(configPath)) {
      const config = fs.readFileSync(configPath, 'utf8');
      const match = config.match(/token\s*=\s*["']([^"']+)["']/);
      if (match) return match[1];
    }
  } catch (e) {}
  
  throw new Error('Unable to find wrangler OAuth token');
}

function addPagesDomain(token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ name: customDomain });
    const options = {
      hostname: 'api.cloudflare.com',
      path: `/client/v4/accounts/${accountId}/pages/projects/${projectName}/domains`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          if (result.success) {
            resolve(result.result);
          } else {
            reject(new Error(result.errors?.map(e => e.message).join(', ') || 'API error'));
          }
        } catch (e) {
          reject(e);
        }
      });
    });
    
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function getZoneId(token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.cloudflare.com',
      path: `/client/v4/zones?name=${customDomain}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          if (result.success && result.result.length > 0) {
            resolve(result.result[0].id);
          } else {
            reject(new Error('Zone not found'));
          }
        } catch (e) {
          reject(e);
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

function createDnsRecord(token, zoneId) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      type: 'CNAME',
      name: '@',
      content: pagesSubdomain,
      proxied: true,
      ttl: 1
    });
    
    const options = {
      hostname: 'api.cloudflare.com',
      path: `/client/v4/zones/${zoneId}/dns_records`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          if (result.success) {
            resolve(result.result);
          } else {
            reject(new Error(result.errors?.map(e => e.message).join(', ') || 'DNS error'));
          }
        } catch (e) {
          reject(e);
        }
      });
    });
    
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  try {
    console.log('🔑 Getting wrangler OAuth token...');
    const token = getWranglerToken();
    console.log('✅ Got token');
    
    console.log(`\n📝 Adding custom domain "${customDomain}" to Pages project...`);
    const domainResult = await addPagesDomain(token);
    console.log('✅ Domain added:', domainResult);
    
    console.log(`\n🔍 Getting zone ID for "${customDomain}"...`);
    const zoneId = await getZoneId(token);
    console.log('✅ Zone ID:', zoneId);
    
    console.log(`\n📤 Creating CNAME DNS record...`);
    const dnsResult = await createDnsRecord(token, zoneId);
    console.log('✅ DNS record created:', dnsResult);
    
    console.log(`\n🎉 Custom domain "${customDomain}" has been successfully added!`);
    console.log('⏳ Please wait 5-10 minutes for SSL certificate to be issued.');
    console.log('🔗 Your site will be available at: https://tarot-yue.cn');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();