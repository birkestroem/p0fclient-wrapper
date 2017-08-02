const execFile = require('child_process').execFile;
const debug = require('debug')('p0fclient-wrapper')
const defaultOptions = {
    'clientPath': '/usr/local/bin/p0f-client', 
    'socketPath': '/var/run/p0f.sock'
};

module.exports = function(ip, options) {
    const opts = Object.assign({}, defaultOptions, options);
    debug('Options: ' + require('util').inspect(opts, { depth: null }));

    return new Promise((resolve, reject) => {
        debug('Looking up IP »' + ip + '«');
        execFile(opts.clientPath, [opts.socketPath, ip], (error, stdout, stderr) => {
            if (error) {
                debug('Client error »' + error + '«');
                reject(error);
                return;
            }

            if (stdout.match("^No matching host in p0f cache.*")) {
                debug('Status is »unknown«');
                resolve({ 'status': 'unknown' });

            } else {
                debug('Status is »known«');
                let data = { 'status': 'known' };

                const lines = stdout.split(/[\r\n]+/);
                lines.forEach((line) => {
                    let match = line.match(/^\s*([^=]+?)\s*=\s*(.*?)\s*$/);
                    if(match){
                        data[match[1].toLowerCase().replace(' ', '-')] = match[2];
                    }
                });

                resolve(data);
            }
        });
    });
}
