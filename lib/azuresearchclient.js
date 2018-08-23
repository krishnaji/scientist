const rp = require('request-promise');

    
    var azureSearchKey ;
    var azureSearchUrl ;
    var azureSearchMaxSearchStringSize;
    

function AzureSearchClient (opts) {
        if (!opts.azureSearchKey) throw new Error('azureSearchKey is required');

    azureSearchKey = opts.azureSearchKey;
    azureSearchUrl = "https://stackbotapp-asben.search.windows.net/indexes/jsonindex/docs";
    azureSearchMaxSearchStringSize = 150;
    
}

AzureSearchClient.prototype.get = async (opts, cb) => {
    if (!opts.searchText) throw new Error('Search text is required');
    cb = cb || (() => {});

    const searchText = opts.searchText.substring(0, azureSearchMaxSearchStringSize).trim();

    const url = azureSearchUrl + "?"
                + `api-version=2017-11-11`
                + `&search=${encodeURIComponent(searchText)}`
                + `&$top=10`
                ;

    const options = {
        method: 'GET',
        uri: url,
        json: true,
        headers: {
            "api-key": azureSearchKey,
            "Content-Type":"application/json"
        }
    };

    await rp(options)
        .then((body) => {
            // POST succeeded
            return cb(null, body);
        })
        .catch((err) => {
            // POST failed
            return cb(err);
        });
}

module.exports = AzureSearchClient;
