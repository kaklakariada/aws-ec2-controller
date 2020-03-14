const { spawnSync } = require('child_process');
const { CONFIG } = require('./deploy-config');

function exec(command, args) {
    const environment = Object.create(process.env);
    environment.AWS_PAGER = '';
    spawnSync(command, args, { stdio: 'inherit', env: environment });
}

const bucket = CONFIG.staticWebsiteBucket;
const cloudfrontDistribution = CONFIG.cloudfrontDistributionId;

console.log(`Uploading static content to bucket ${bucket}...`);
exec('aws', ['s3', 'sync', 'build', `s3://${bucket}/`]);
console.log(`Invalidating cache for Cloudfront distribution ${cloudfrontDistribution}...`);
exec('aws', ['cloudfront', 'create-invalidation', '--distribution-id', cloudfrontDistribution, '--paths', '/*']);
console.log(`Done.`);
