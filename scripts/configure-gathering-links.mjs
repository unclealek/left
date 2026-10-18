// Run only after choosing and hosting the share domain. This edits local native config;
// it does not deploy, create credentials, modify DNS, or build the app.
import {readFileSync,writeFileSync} from 'node:fs';
const url=new URL(process.argv[2] || '');
if(url.protocol!=='https:' || url.username || url.password || url.search || url.hash || url.pathname!=='/' || url.port)throw new Error('Use the HTTPS root origin of your share domain');
const domain=`applinks:${url.hostname}`;
const app=JSON.parse(readFileSync('app.json','utf8'));
app.expo.ios.associatedDomains=[...new Set([...(app.expo.ios.associatedDomains || []),domain])];
const path='ios/Left/Left.entitlements';
let xml=readFileSync(path,'utf8');
if(xml.includes('com.apple.developer.associated-domains'))throw new Error('Associated-domains entitlement already exists; review it before changing it');
xml=xml.replace('  </dict>',`    <key>com.apple.developer.associated-domains</key>\n    <array><string>${domain}</string></array>\n  </dict>`);
writeFileSync('app.json',JSON.stringify(app,null,2)+'\n');
writeFileSync(path,xml);
console.log('Configured local associated domain:',url.hostname);
console.log('Set EXPO_PUBLIC_GATHERING_SHARE_ORIGIN in the intended EAS environment to this origin; update the provisioning profile, build and verify universal links on device.');
