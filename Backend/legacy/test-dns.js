import dns from 'node:dns';

dns.resolveSrv('_mongodb._tcp.cluster0.tw03d7x.mongodb.net', (err, addresses) => {
    if (err) {
        console.error('DNS SRV Resolution Failed:', err);
    } else {
        console.log('DNS SRV Resolution Succeeded:', addresses);
    }
    process.exit(0);
});
